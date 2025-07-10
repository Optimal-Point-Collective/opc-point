-- Add role column to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';

-- Update existing admin user (replace 'admin@example.com' with your admin's email)
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'admin@example.com'  -- Replace with your admin email
);

-- Create or update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
