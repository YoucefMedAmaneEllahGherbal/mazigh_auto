create or replace function public.save_car_sale_status(
  p_car_id uuid,
  p_next_status text,
  p_prix_vente numeric,
  p_date_vente date,
  p_prix_achat numeric,
  p_frais numeric,
  p_acheteur text,
  p_notes text,
  p_clear_sale_data boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.showroom_owners as owner
    where owner.user_id = auth.uid()
  ) then
    raise exception using errcode = '42501', message = 'Accès réservé au propriétaire du showroom.';
  end if;

  if p_next_status is null or p_next_status not in ('vendue', 'disponible') then
    raise exception using errcode = '22023', message = 'Statut de vente invalide.';
  end if;

  if p_clear_sale_data is null
    or (p_prix_achat is not null and (p_prix_achat < 0 or p_prix_achat::text in ('NaN', 'Infinity', '-Infinity')))
    or (p_frais is not null and (p_frais < 0 or p_frais::text in ('NaN', 'Infinity', '-Infinity'))) then
    raise exception using errcode = '22023', message = 'Informations financières invalides.';
  end if;

  if p_next_status = 'vendue' then
    if p_prix_vente is null
      or p_prix_vente < 0
      or p_prix_vente::text in ('NaN', 'Infinity', '-Infinity')
      or p_date_vente is null
      then
      raise exception using errcode = '22023', message = 'Informations de vente invalides.';
    end if;

    update public.cars
    set statut = 'vendue', updated_at = pg_catalog.now()
    where id = p_car_id and statut <> 'vendue';

    if not found then
      raise exception using errcode = 'P0002', message = 'Véhicule introuvable ou accès refusé.';
    end if;

    insert into public.car_finances (
      car_id, prix_achat, frais, prix_vente, date_vente, acheteur, notes
    )
    values (
      p_car_id, p_prix_achat, p_frais, p_prix_vente, p_date_vente, p_acheteur, p_notes
    )
    on conflict (car_id) do update set
      prix_achat = excluded.prix_achat,
      frais = excluded.frais,
      prix_vente = excluded.prix_vente,
      date_vente = excluded.date_vente,
      acheteur = excluded.acheteur,
      notes = excluded.notes;
  else
    update public.cars
    set statut = 'disponible', updated_at = pg_catalog.now()
    where id = p_car_id and statut = 'vendue';

    if not found then
      raise exception using errcode = 'P0002', message = 'Véhicule introuvable ou accès refusé.';
    end if;

    insert into public.car_finances as existing (car_id, prix_achat, frais, notes)
    values (p_car_id, p_prix_achat, p_frais, p_notes)
    on conflict (car_id) do update set
      prix_achat = excluded.prix_achat,
      frais = excluded.frais,
      notes = excluded.notes,
      prix_vente = case when p_clear_sale_data then null else existing.prix_vente end,
      date_vente = case when p_clear_sale_data then null else existing.date_vente end,
      acheteur = case when p_clear_sale_data then null else existing.acheteur end;
  end if;
end;
$function$;

revoke all on function public.save_car_sale_status(uuid, text, numeric, date, numeric, numeric, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.save_car_sale_status(uuid, text, numeric, date, numeric, numeric, text, text, boolean)
  to authenticated;

notify pgrst, 'reload schema';