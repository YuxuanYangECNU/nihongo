-- Run once in the Supabase SQL editor; create the personal user via Auth > Users.
create table if not exists public.learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_state enable row level security;
drop policy if exists "Read own state" on public.learning_state;
create policy "Read own state" on public.learning_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own state" on public.learning_state;
create policy "Insert own state" on public.learning_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own state" on public.learning_state;
create policy "Update own state" on public.learning_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- The invoker remains subject to RLS. A row lock serializes concurrent devices.
create or replace function public.merge_learning_state(incoming jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
  current_state jsonb;
  item record;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(incoming) <> 'object' or pg_column_size(incoming) > 16384 then
    raise exception 'Invalid preferences';
  end if;
  insert into public.learning_state(user_id) values(uid) on conflict do nothing;
  select state into current_state from public.learning_state where user_id=uid for update;
  for item in select key, value from jsonb_each(incoming) loop
    if item.key not in ('theme','kana','meaning','reading') then continue; end if;
    if jsonb_typeof(item.value) <> 'object' or jsonb_typeof(item.value->'updatedAt') <> 'number' then continue; end if;
    if not (current_state ? item.key) or (item.value->>'updatedAt')::numeric >= (current_state->item.key->>'updatedAt')::numeric then
      current_state := jsonb_set(current_state, array[item.key], item.value);
    end if;
  end loop;
  update public.learning_state set state=current_state,updated_at=now() where user_id=uid;
  return current_state;
end;
$$;
revoke all on function public.merge_learning_state(jsonb) from public, anon;
grant execute on function public.merge_learning_state(jsonb) to authenticated;
grant select,insert,update on public.learning_state to authenticated;
