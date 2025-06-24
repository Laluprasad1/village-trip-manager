
-- Delete all data from user-related tables (in correct order due to foreign key constraints)
DELETE FROM public.trips;
DELETE FROM public.companies;
DELETE FROM public.drivers;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Delete all users from auth.users (this will cascade to related tables)
DELETE FROM auth.users;

-- Reset serial number sequence for drivers
-- This ensures new drivers start from serial number 1 again
-- Note: We don't need to reset the actual sequence since we're using MAX(serial_number) + 1 in the trigger
