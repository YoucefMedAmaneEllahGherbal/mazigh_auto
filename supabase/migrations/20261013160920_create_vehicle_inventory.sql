create table public.showroom_owners (
	user_id uuid primary key references auth.users (id) on delete cascade,
	granted_at timestamptz not null default pg_catalog.now()
);

comment on table public.showroom_owners is
	'Trusted administrator-managed allowlist of users authorized to manage showroom inventory.';

create table public.vehicles (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	make text not null,
	model text not null,
	version text not null default '',
	year smallint not null,
	price_dzd numeric(12, 0) not null,
	mileage_km integer not null,
	engine text not null,
	fuel_type text not null,
	transmission text not null,
	color text not null,
	description text not null default '',
	features text[] not null default '{}'::text[],
	image_urls text[] not null default '{}'::text[],
	cover_image_url text,
	status text not null default 'draft',
	created_at timestamptz not null default pg_catalog.now(),
	updated_at timestamptz not null default pg_catalog.now(),

	constraint vehicles_slug_format check (
		slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
	),
	constraint vehicles_make_not_blank check (length(btrim(make)) > 0),
	constraint vehicles_model_not_blank check (length(btrim(model)) > 0),
	constraint vehicles_year_range check (year between 1886 and 2100),
	constraint vehicles_price_nonnegative check (price_dzd >= 0),
	constraint vehicles_mileage_nonnegative check (mileage_km >= 0),
	constraint vehicles_fuel_type_valid check (
		fuel_type in ('diesel', 'essence', 'hybrid', 'electric')
	),
	constraint vehicles_transmission_valid check (
		transmission in ('Automatique', 'Manuelle')
	),
	constraint vehicles_status_valid check (
		status in ('draft', 'available', 'reserved', 'sold')
	),
	constraint vehicles_features_no_nulls check (
		array_position(features, null) is null
	),
	constraint vehicles_image_urls_no_nulls check (
		array_position(image_urls, null) is null
	),
	constraint vehicles_image_urls_no_blanks check (
		array_position(image_urls, '') is null
	),
	constraint vehicles_cover_image_not_blank check (
		cover_image_url is null or length(btrim(cover_image_url)) > 0
	),
	constraint vehicles_cover_is_gallery_image check (
		cover_image_url is null or cover_image_url = any(image_urls)
	),
	constraint vehicles_published_has_cover check (
		status = 'draft'
		or (cover_image_url is not null and cardinality(image_urls) > 0)
	)
);

comment on column public.vehicles.price_dzd is
	'Whole-unit Algerian dinar price; numeric avoids floating-point rounding.';
comment on column public.vehicles.mileage_km is
	'Whole kilometers; the existing demo data currently stores formatted mileage text.';
comment on column public.vehicles.image_urls is
	'Image URLs in display order; cover_image_url must be one of these entries.';
comment on column public.vehicles.status is
	'Draft rows are private; available, reserved, and sold rows are public.';

create index vehicles_public_catalog_created_at_idx
	on public.vehicles (created_at desc)
	where status <> 'draft';

create function public.set_vehicle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
	new.updated_at = pg_catalog.now();
	return new;
end;
$function$;

revoke all on function public.set_vehicle_updated_at()
	from public, anon, authenticated;

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row
execute function public.set_vehicle_updated_at();

alter table public.showroom_owners enable row level security;
alter table public.vehicles enable row level security;

revoke all on table public.showroom_owners from public, anon, authenticated;
grant select on table public.showroom_owners to authenticated;

revoke all on table public.vehicles from public, anon, authenticated;
grant select on table public.vehicles to anon, authenticated;
grant insert, update, delete on table public.vehicles to authenticated;

create policy "Users can read their own showroom membership"
on public.showroom_owners
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Visitors can read published vehicles"
on public.vehicles
for select
to anon, authenticated
using (status <> 'draft');

create policy "Showroom owners can read all vehicles"
on public.vehicles
for select
to authenticated
using (
	exists (
		select 1
		from public.showroom_owners as membership
		where membership.user_id = (select auth.uid())
	)
);

create policy "Showroom owners can insert vehicles"
on public.vehicles
for insert
to authenticated
with check (
	exists (
		select 1
		from public.showroom_owners as membership
		where membership.user_id = (select auth.uid())
	)
);

create policy "Showroom owners can update vehicles"
on public.vehicles
for update
to authenticated
using (
	exists (
		select 1
		from public.showroom_owners as membership
		where membership.user_id = (select auth.uid())
	)
)
with check (
	exists (
		select 1
		from public.showroom_owners as membership
		where membership.user_id = (select auth.uid())
	)
);

create policy "Showroom owners can delete vehicles"
on public.vehicles
for delete
to authenticated
using (
	exists (
		select 1
		from public.showroom_owners as membership
		where membership.user_id = (select auth.uid())
	)
);
