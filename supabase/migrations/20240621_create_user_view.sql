-- Create a secure view that joins auth.users with public.profiles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  p.full_name,
  p.avatar_url,
  p.membership_type,
  p.subscription_end_date,
  p.affiliate_code,
  p.days_left,
  p.status,
  p.telegram_id,
  p.created_at,
  p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Set up RLS for the view
ALTER VIEW public.user_profiles OWNER TO service_role;

-- Create policies for the view
DO $$
BEGIN
  -- Users can view their own profile
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Admins can view all profiles
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON public.user_profiles
      FOR SELECT USING (is_admin());
  END IF;
END
$$;

-- Grant permissions
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
