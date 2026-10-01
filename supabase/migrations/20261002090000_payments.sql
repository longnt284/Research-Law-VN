-- Thanh toán bằng chuyển khoản QR (payOS) và lượt Pro của trợ lý hỏi đáp.
--
-- 1. `orders`: mỗi lần bấm thanh toán là một đơn. Giá và số lượt được chụp vào
--    đơn lúc tạo, lấy từ bảng giá phía máy chủ (`src/lib/plans.ts`), nên đổi
--    bảng giá sau này không làm sai các đơn cũ. `provider_order_id` là
--    `orderCode` gửi cho payOS: số nguyên do cơ sở dữ liệu cấp, không trùng.
-- 2. `credit_ledger`: sổ cái lượt Pro. Mỗi lần cộng (mua, hoàn) hay trừ (dùng)
--    là một hàng. `order_id` là duy nhất, nên một đơn chỉ cộng lượt được một lần
--    dù webhook đến bao nhiêu lần: cơ sở dữ liệu chặn, không chỉ mã ứng dụng.
-- 3. `billing_accounts`: số dư lượt Pro hiện tại của mỗi người, luôn bằng tổng
--    sổ cái của người đó và không bao giờ âm.
--
-- Ba bảng không có policy nào cho `anon` và `authenticated`: trình duyệt không
-- đọc, ghi thẳng được. Mọi thao tác đi qua API của trang bằng khóa bí mật phía
-- máy chủ, sau khi API đã xác minh người gọi.
--
-- Xóa tài khoản: số dư bị xóa theo; đơn và sổ cái được giữ nhưng mất liên kết
-- với người dùng (`on delete set null`), để còn đối soát với payOS.

create table public.billing_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  plan_id text not null check (plan_id ~ '^[a-z0-9-]{1,40}$'),
  provider text not null check (provider in ('payos')),
  amount_vnd integer not null check (amount_vnd > 0),
  currency text not null default 'VND' check (currency = 'VND'),
  credits integer not null check (credits > 0),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED')),
  provider_order_id bigint generated always as identity (start with 100001) unique,
  provider_link_id text,
  provider_transaction_id text,
  checkout_url text,
  qr_code text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((status = 'PAID') = (paid_at is not null))
);

create index orders_user_created on public.orders (user_id, created_at desc);

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid unique references public.orders (id),
  credit_amount integer not null check (credit_amount <> 0),
  type text not null check (type in ('PURCHASE', 'USAGE', 'REFUND')),
  created_at timestamptz not null default now(),
  check ((type = 'PURCHASE') = (order_id is not null))
);

create index credit_ledger_user_created on public.credit_ledger (user_id, created_at desc);

alter table public.billing_accounts enable row level security;
alter table public.orders enable row level security;
alter table public.credit_ledger enable row level security;
revoke all on table public.billing_accounts, public.orders, public.credit_ledger from anon, authenticated;

-- Xác nhận một giao dịch payOS đã kiểm chữ ký. Cả hàm chạy trong một giao dịch
-- cơ sở dữ liệu: đơn chuyển PAID, sổ cái ghi một hàng, số dư tăng, hoặc không
-- việc nào xảy ra. `for update` khóa hàng đơn, nên hai webhook đến cùng lúc
-- cho cùng một đơn chạy lần lượt, và webhook sau thấy đơn đã PAID.
--
-- Trả về: `paid` (vừa xác nhận), `duplicate` (đơn đã PAID từ trước, không cộng
-- thêm), `unknown_order`, `amount_mismatch`, `currency_mismatch`,
-- `link_mismatch`, `no_user` (tài khoản đã bị xóa). Chỉ `paid` cộng lượt.
--
-- Đơn PENDING, EXPIRED hay CANCELLED đều nhận xác nhận: webhook hợp lệ nghĩa là
-- tiền đã vào tài khoản, nên người mua phải nhận đủ lượt.
create function public.confirm_payos_payment(
  p_order_code bigint,
  p_amount integer,
  p_currency text,
  p_link_id text,
  p_reference text
)
returns text
language plpgsql
set search_path = ''
as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders
   where provider_order_id = p_order_code and provider = 'payos'
   for update;
  if not found then
    return 'unknown_order';
  end if;
  if o.status = 'PAID' then
    return 'duplicate';
  end if;
  if p_amount is distinct from o.amount_vnd then
    return 'amount_mismatch';
  end if;
  if p_currency is distinct from o.currency then
    return 'currency_mismatch';
  end if;
  if p_link_id is distinct from o.provider_link_id then
    return 'link_mismatch';
  end if;
  if o.user_id is null then
    return 'no_user';
  end if;

  update public.orders
     set status = 'PAID', paid_at = now(), updated_at = now(), provider_transaction_id = p_reference
   where id = o.id;
  insert into public.credit_ledger (user_id, order_id, credit_amount, type)
  values (o.user_id, o.id, o.credits, 'PURCHASE');
  insert into public.billing_accounts as b (user_id, credit_balance)
  values (o.user_id, o.credits)
  on conflict (user_id) do update
    set credit_balance = b.credit_balance + excluded.credit_balance, updated_at = now();
  return 'paid';
end;
$$;

-- Trừ lượt cho một câu hỏi Pro. Chỉ trừ khi đủ số dư, trong cùng một câu lệnh,
-- nên hai câu hỏi gửi cùng lúc không trừ quá số dư. Trả về số dư còn lại, hoặc
-- null khi không đủ lượt (hay chưa từng mua).
create function public.spend_credits(p_user_id uuid, p_cost integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
begin
  if p_cost is null or p_cost <= 0 then
    raise exception 'cost must be positive' using errcode = 'check_violation';
  end if;
  update public.billing_accounts
     set credit_balance = credit_balance - p_cost, updated_at = now()
   where user_id = p_user_id and credit_balance >= p_cost
  returning credit_balance into v_balance;
  if not found then
    return null;
  end if;
  insert into public.credit_ledger (user_id, credit_amount, type)
  values (p_user_id, -p_cost, 'USAGE');
  return v_balance;
end;
$$;

-- Hoàn lượt đã trừ khi mọi nhà cung cấp mô hình đều từ chối câu hỏi.
create function public.refund_credits(p_user_id uuid, p_cost integer)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_cost is null or p_cost <= 0 then
    raise exception 'cost must be positive' using errcode = 'check_violation';
  end if;
  update public.billing_accounts
     set credit_balance = credit_balance + p_cost, updated_at = now()
   where user_id = p_user_id;
  if found then
    insert into public.credit_ledger (user_id, credit_amount, type)
    values (p_user_id, p_cost, 'REFUND');
  end if;
end;
$$;

revoke execute on function
  public.confirm_payos_payment(bigint, integer, text, text, text),
  public.spend_credits(uuid, integer),
  public.refund_credits(uuid, integer)
  from public, anon, authenticated;
grant execute on function
  public.confirm_payos_payment(bigint, integer, text, text, text),
  public.spend_credits(uuid, integer),
  public.refund_credits(uuid, integer)
  to service_role;
