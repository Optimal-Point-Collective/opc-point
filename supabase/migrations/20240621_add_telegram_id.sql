-- Add telegram_id column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS telegram_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the view to include the new column
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
