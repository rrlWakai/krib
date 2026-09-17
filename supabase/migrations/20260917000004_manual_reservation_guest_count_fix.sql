-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Fix manual reservation guest_count (23502)
-- ──────────────────────────────────────────────
-- Migration 20260917000004
-- Production bug: create_manual_reservation() inserted into reservations
-- without guest_count, violating the NOT NULL constraint:
--   23502 null value in column "guest_count" of relation "reservations"
--
-- Fix (no schema changes, no constraint changes):
--   1. Drop the broken 6-parameter function (superseded signature).
--   2. Recreate it with party composition parameters and server-side
--      validation: guest_count = adults + children (infants and pets are
--      never counted, matching the public create_reservation flow).
--   3. guest_count is now explicitly provided in the INSERT.
--
-- Option B flow is preserved:
--   authenticated active admin → manual reservation → status = approved
--   (approved_by = calling admin, approved_at = now())
--   The INSERT still goes in as 'pending' (enforce_reservation_insert_rules
--   G1 invariant) and is approved atomically in the same transaction —
--   the public pending → admin approval lifecycle is untouched.
-- ──────────────────────────────────────────────

-- 1. Remove the broken function signature deployed by 20260917000003.
DROP FUNCTION IF EXISTS public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID
);

-- 2. Recreate with guest_count / party composition + validation.
CREATE OR REPLACE FUNCTION public.create_manual_reservation(
  p_villa_id UUID,
  p_guest_id UUID,
  p_arrival_datetime TIMESTAMPTZ,
  p_special_requests TEXT,
  p_is_party BOOLEAN,
  p_admin_user_id UUID,
  p_guest_count INTEGER,
  p_adults INTEGER,
  p_children INTEGER,
  p_infants INTEGER,
  p_pets INTEGER
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

  -- Server-side party composition validation (source of truth).
  IF p_adults IS NULL OR p_adults < 1 THEN
    RAISE EXCEPTION 'adults must be at least 1';
  END IF;
  IF p_children IS NULL OR p_children < 0 THEN
    RAISE EXCEPTION 'children must be non-negative';
  END IF;
  IF p_infants IS NULL OR p_infants < 0 THEN
    RAISE EXCEPTION 'infants must be non-negative';
  END IF;
  IF p_pets IS NULL OR p_pets < 0 THEN
    RAISE EXCEPTION 'pets must be non-negative';
  END IF;
  IF p_guest_count IS DISTINCT FROM (p_adults + p_children) THEN
    RAISE EXCEPTION 'guest_count must equal adults + children';
  END IF;
  IF p_guest_count < 1 THEN
    RAISE EXCEPTION 'guest_count must be at least 1';
  END IF;

  INSERT INTO public.reservations (
    villa_id,
    guest_id,
    guest_count,
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
    p_guest_count,
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
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
) FROM anon;
REVOKE ALL ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
) TO service_role;

COMMENT ON FUNCTION public.create_manual_reservation(
  UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
) IS 'Creates an admin manual reservation by inserting pending and approving atomically. guest_count = adults + children (infants/pets excluded).';

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP FUNCTION IF EXISTS public.create_manual_reservation(
--   UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER
-- );
-- ──────────────────────────────────────────────