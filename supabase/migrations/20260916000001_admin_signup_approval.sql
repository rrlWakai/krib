-- KRiB Beverly Place - Secure admin signup and approval
-- Auth users are mapped to inactive admin profiles until an owner approves them.

CREATE OR REPLACE FUNCTION public.create_pending_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (auth_user_id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), 'Pending administrator'),
    'staff',
    false
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_pending_admin_user();

CREATE OR REPLACE FUNCTION public.approve_admin_user(target_admin_id UUID)
RETURNS public.admin_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approved_user public.admin_users;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'owner'
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Owner approval required';
  END IF;

  UPDATE public.admin_users
  SET is_active = true
  WHERE id = target_admin_id
    AND is_active = false
  RETURNING * INTO approved_user;

  IF approved_user.id IS NULL THEN
    RAISE EXCEPTION 'Pending administrator not found';
  END IF;

  RETURN approved_user;
END;
$$;

REVOKE ALL ON FUNCTION public.create_pending_admin_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_admin_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_admin_user(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'owner'
      AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "Admin full access to admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Owners can manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (is_owner())
  WITH CHECK (is_owner());

REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;

-- Reversible:
-- DROP POLICY IF EXISTS "Owners can manage admin users" ON public.admin_users;
-- DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
-- DROP FUNCTION IF EXISTS public.is_owner();
-- DROP FUNCTION IF EXISTS public.approve_admin_user(UUID);
-- DROP TRIGGER IF EXISTS on_auth_user_created_admin_profile ON auth.users;
-- DROP FUNCTION IF EXISTS public.create_pending_admin_user();