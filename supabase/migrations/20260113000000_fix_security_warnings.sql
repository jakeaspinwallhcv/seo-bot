-- Fix security warnings from Supabase Database Linter
-- Sets immutable search_path for functions to prevent search path hijacking

-- Fix handle_new_user function - Add SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function - Add SET search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile on signup. search_path set for security.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates updated_at timestamp on record changes. search_path set for security.';
