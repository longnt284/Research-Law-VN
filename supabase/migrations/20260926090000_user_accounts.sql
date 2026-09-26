-- Tài khoản người dùng của Lex & Lineage.
--
-- Đăng ký, đăng nhập và mật khẩu do Supabase Auth (bảng auth.users) quản lý.
-- Hai bảng dưới đây chỉ giữ những gì người dùng làm trên trang: văn bản đang
-- theo dõi và bộ hồ sơ. Không bảng nào chép lại dữ liệu văn bản: mọi thông
-- tin về văn bản đọc từ tập dữ liệu của trang theo mã `doc_id`.
--
-- Mỗi hàng thuộc đúng một người dùng, và Row Level Security bảo đảm người dùng
-- chỉ đọc, ghi được hàng của chính mình. Xóa người dùng là xóa theo mọi hàng.

create table public.follows (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  doc_id text not null check (doc_id ~ '^[a-z0-9-]{1,120}$'),
  since date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (user_id, doc_id)
);

comment on table public.follows is 'Văn bản người dùng đang theo dõi; since là ngày bắt đầu theo dõi.';

create table public.matters (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9]{1,40}$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  doc_ids text[] not null default '{}' check (cardinality(doc_ids) <= 500),
  created date not null default current_date,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

comment on table public.matters is 'Bộ hồ sơ: nhóm văn bản của một vụ việc hay dự án.';

alter table public.follows enable row level security;
alter table public.matters enable row level security;

create policy "follows: own rows" on public.follows
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "matters: own rows" on public.matters
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Người dùng tự xóa tài khoản của mình. Hàm chạy với quyền của chủ hàm để xóa
-- được hàng trong auth.users, nhưng chỉ xóa đúng người đang gọi.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
