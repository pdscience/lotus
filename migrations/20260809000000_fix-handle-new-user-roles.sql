-- Fix handle_new_user_roles: auth.users has no "raw_user_meta_data" column
-- (InsForge uses "metadata"). This bug broke every signup with
-- "record new has no field raw_user_meta_data".
CREATE OR REPLACE FUNCTION public.handle_new_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, tipo)
  VALUES (NEW.id, COALESCE(NEW.metadata->>'tipo', 'vitima'))
  ON CONFLICT (user_id) DO UPDATE SET tipo = EXCLUDED.tipo;
  RETURN NEW;
END;
$function$
