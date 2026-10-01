-- Kiểm tra phần cơ sở dữ liệu của thanh toán (migration `*_payments.sql`).
--
-- Chạy được trên chính cơ sở dữ liệu thật: mọi thứ nằm trong một giao dịch và
-- kết thúc bằng `rollback`, nên không để lại hàng nào. Mỗi khối `do` tự báo lỗi
-- khi kết quả sai; chạy hết mà không lỗi nghĩa là đạt.
--
-- Cách chạy: dán cả tệp vào Supabase SQL Editor, hoặc
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/payments_test.sql

begin;

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-00000000000a', 'payments-test-a@example.invalid'),
  ('00000000-0000-4000-8000-00000000000b', 'payments-test-b@example.invalid');

create temporary table t_order on commit drop as
with o as (
  insert into public.orders (user_id, plan_id, provider, amount_vnd, credits, provider_link_id, expires_at)
  values ('00000000-0000-4000-8000-00000000000a', 'plus', 'payos', 50000, 120, 'link-a', now() + interval '15 minutes')
  returning id, provider_order_id
)
select * from o;

grant select on t_order to authenticated;

-- Sai số tiền, sai mã link, đơn không tồn tại: không cộng lượt, đơn vẫn PENDING.
do $$
declare
  code bigint := (select provider_order_id from t_order);
begin
  if public.confirm_payos_payment(code, 10000, 'VND', 'link-a', 'REF1') is distinct from 'amount_mismatch' then
    raise exception 'amount mismatch not rejected';
  end if;
  if public.confirm_payos_payment(code, 50000, 'USD', 'link-a', 'REF1') is distinct from 'currency_mismatch' then
    raise exception 'currency mismatch not rejected';
  end if;
  if public.confirm_payos_payment(code, 50000, 'VND', 'link-x', 'REF1') is distinct from 'link_mismatch' then
    raise exception 'link mismatch not rejected';
  end if;
  if public.confirm_payos_payment(-1, 50000, 'VND', 'link-a', 'REF1') is distinct from 'unknown_order' then
    raise exception 'unknown order not rejected';
  end if;
  if (select status from public.orders where id = (select id from t_order)) is distinct from 'PENDING' then
    raise exception 'rejected webhook changed the order';
  end if;
  if exists (select 1 from public.billing_accounts where user_id = '00000000-0000-4000-8000-00000000000a')
     or exists (select 1 from public.credit_ledger where user_id = '00000000-0000-4000-8000-00000000000a') then
    raise exception 'rejected webhook granted credits';
  end if;
end;
$$;

-- Webhook hợp lệ: đơn PAID, cộng đúng 120 lượt; gửi lại ba lần vẫn chỉ cộng một lần.
do $$
declare
  code bigint := (select provider_order_id from t_order);
  i int;
begin
  if public.confirm_payos_payment(code, 50000, 'VND', 'link-a', 'REF1') is distinct from 'paid' then
    raise exception 'valid payment not accepted';
  end if;
  for i in 1..3 loop
    if public.confirm_payos_payment(code, 50000, 'VND', 'link-a', 'REF1') is distinct from 'duplicate' then
      raise exception 'duplicate webhook not detected';
    end if;
  end loop;
  if (select status from public.orders where id = (select id from t_order)) is distinct from 'PAID'
     or (select paid_at from public.orders where id = (select id from t_order)) is null then
    raise exception 'order not marked PAID';
  end if;
  if (select credit_balance from public.billing_accounts
       where user_id = '00000000-0000-4000-8000-00000000000a') is distinct from 120 then
    raise exception 'balance is not 120';
  end if;
  if (select count(*) from public.credit_ledger where order_id = (select id from t_order)) is distinct from 1 then
    raise exception 'ledger does not have exactly one purchase';
  end if;
end;
$$;

-- Lớp chặn cuối ở cơ sở dữ liệu: ghi tay hàng PURCHASE thứ hai cho cùng đơn bị từ chối.
do $$
begin
  insert into public.credit_ledger (user_id, order_id, credit_amount, type)
  values ('00000000-0000-4000-8000-00000000000a', (select id from t_order), 120, 'PURCHASE');
  raise exception 'second purchase row was accepted';
exception
  when unique_violation then null;
end;
$$;

-- Trừ và hoàn lượt.
do $$
declare
  a uuid := '00000000-0000-4000-8000-00000000000a';
begin
  if public.spend_credits(a, 1) is distinct from 119 then
    raise exception 'spend did not return 119';
  end if;
  if public.spend_credits(a, 500) is not null then
    raise exception 'overspend was allowed';
  end if;
  if public.spend_credits('00000000-0000-4000-8000-00000000000b', 1) is not null then
    raise exception 'user without balance could spend';
  end if;
  perform public.refund_credits(a, 1);
  if (select credit_balance from public.billing_accounts where user_id = a) is distinct from 120 then
    raise exception 'refund did not restore balance';
  end if;
  if (select sum(credit_amount) from public.credit_ledger where user_id = a) is distinct from 120 then
    raise exception 'ledger does not add up to balance';
  end if;
end;
$$;

-- Người dùng đã đăng nhập (kể cả chủ đơn) không đọc, ghi hay gọi hàm được trực tiếp.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b","role":"authenticated"}', true);

do $$
begin
  perform 1 from public.orders;
  raise exception 'authenticated user could read orders';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  perform 1 from public.billing_accounts;
  raise exception 'authenticated user could read balances';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  perform public.spend_credits('00000000-0000-4000-8000-00000000000a', 1);
  raise exception 'authenticated user could call spend_credits';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  perform public.confirm_payos_payment((select provider_order_id from t_order), 50000, 'VND', 'link-a', 'REF1');
  raise exception 'authenticated user could call confirm_payos_payment';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;

select 'payments_test: all checks passed' as result;

rollback;
