-- KRiB Beverly Place — Trusted manual reservation creation
-- Manual bookings still pass through the normal pending insert invariant,
-- then transition to approved atomically inside one database transaction.

CREATE OR REPLACE FUNCTION public.create_manual_reservation(
  p_villa_id UUID,
  p_guest_id UUID,
  p_arrival_datetime TIMESTAMPTZ,
  p_special_requests TEXT,
  p_is_party BOOLEAN,
  p_admin_user_id UUID
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_reservation public.reservations;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = p_admin_user_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Active admin authorization required';
  END IF;

  INSERT INTO public.reservations (
    villa_id,
    guest_id,
    arrival_datetime,
    checkout_datetime,
    special_requests,
    terms_accepted,
    privacy_accepted,
    is_party,
    status
  )
  VALUES (
    p_villa_id,
    p_guest_id,
    p_arrival_datetime,
    p_arrival_datetime + interval '21 hours',
    COALESCE(p_special_requests, ''),
    true,
    true,
    COALESCE(p_is_party, false),
    'pending'
  )
  RETURNING * INTO created_reservation;

  UPDATE public.reservations
  SET status = 'approved',
      approved_at = now(),
      approved_by = p_admin_user_id
  WHERE id = created_reservation.id
  RETURNING * INTO created_reservation;

  RETURN created_reservation;
END;
$$;

REVOKE ALL ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
) FROM anon;
REVOKE ALL ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
) TO service_role;

COMMENT ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
) IS 'Creates an admin manual reservation by inserting pending and approving atomically.';
