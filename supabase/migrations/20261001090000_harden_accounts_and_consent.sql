-- Gia cố hai bảng tài khoản và ghi bằng chứng đồng ý khi đăng ký.
--
-- 1. `anon` không có policy nào nên RLS đã chặn; thu hồi luôn quyền bảng để
--    có hai lớp chặn thay vì một.
-- 2. Trần số hàng mỗi người: kho chỉ có vài trăm văn bản, nên 1000 văn bản
--    theo dõi và 100 bộ hồ sơ là dư cho người dùng thật, nhưng chặn được một
--    tài khoản ghi vô hạn hàng vào cơ sở dữ liệu.
-- 3. Bảng `consents`: người dùng đồng ý chính sách phiên bản nào, lúc nào.
--    Hàng do trigger trên `auth.users` ghi, thời điểm lấy theo đồng hồ máy chủ;
--    người dùng chỉ đọc được hàng của mình, không thêm, sửa hay xóa được.

revoke all on table public.follows, public.matters from anon;

-- Trần số văn bản theo dõi. `push()` ở trình duyệt upsert lại cả danh sách, nên
-- một hàng đã có thì luôn cho qua; chỉ chặn hàng mới khi đã chạm trần.
create function public.enforce_follows_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
       select 1 from public.follows where user_id = new.user_id and doc_id = new.doc_id
     )
     and (select count(*) from public.follows where user_id = new.user_id) >= 1000 then
    raise exception 'follows limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger follows_cap
  before insert on public.follows
  for each row execute function public.enforce_follows_cap();

-- Trần số bộ hồ sơ, và mỗi mã văn bản trong bộ hồ sơ theo đúng dạng mã của
-- bảng `follows`.
create function public.enforce_matters_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  d text;
begin
  foreach d in array new.doc_ids loop
    if d is null or d !~ '^[a-z0-9-]{1,120}$' then
      raise exception 'invalid doc id in matter' using errcode = 'check_violation';
    end if;
  end loop;
  if tg_op = 'INSERT'
     and not exists (
       select 1 from public.matters where user_id = new.user_id and id = new.id
     )
     and (select count(*) from public.matters where user_id = new.user_id) >= 100 then
    raise exception 'matters limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger matters_rules
  before insert or update on public.matters
  for each row execute function public.enforce_matters_rules();

revoke execute on function public.enforce_follows_cap() from public, anon, authenticated;
revoke execute on function public.enforce_matters_rules() from public, anon, authenticated;

create table public.consents (
  user_id uuid not null references auth.users (id) on delete cascade,
  policy_version text not null check (policy_version ~ '^\d{4}-\d{2}-\d{2}$'),
  accepted_at timestamptz not null default now(),
  primary key (user_id, policy_version)
);

comment on table public.consents is 'Bằng chứng đồng ý: phiên bản chính sách và thời điểm đồng ý khi đăng ký.';

alter table public.consents enable row level security;

create policy "consents: read own" on public.consents
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.consents from anon;
revoke insert, update, delete, truncate on table public.consents from authenticated;

-- Trang gửi `policy_version` trong `options.data` của `signUp`; Supabase lưu nó
-- vào `raw_user_meta_data`. Người dùng sửa được metadata của mình về sau, nên
-- chép sang bảng riêng ngay lúc tạo tài khoản mới là bằng chứng giữ được.
create function public.record_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v text := new.raw_user_meta_data ->> 'policy_version';
begin
  if v ~ '^\d{4}-\d{2}-\d{2}$' then
    insert into public.consents (user_id, policy_version)
    values (new.id, v)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function public.record_signup_consent() from public, anon, authenticated;

create trigger on_auth_user_created_record_consent
  after insert on auth.users
  for each row execute function public.record_signup_consent();
