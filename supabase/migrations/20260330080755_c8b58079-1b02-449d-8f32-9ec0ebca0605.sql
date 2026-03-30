ALTER TABLE public.drivers DROP CONSTRAINT drivers_user_id_fkey;
ALTER TABLE public.drivers ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;