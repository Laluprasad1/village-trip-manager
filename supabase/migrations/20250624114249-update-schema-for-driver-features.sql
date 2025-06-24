-- Add driver name and vehicle details to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS driver_name TEXT REFERENCES public.profiles(full_name);

-- Update RLS policies for drivers table
CREATE POLICY "Drivers can view all drivers" ON public.drivers
  FOR SELECT USING (
    has_role(auth.uid(), 'driver') OR 
    has_role(auth.uid(), 'admin')
  ) WITH CHECK (
    has_role(auth.uid(), 'admin')
  );

-- Update RLS policies for trips table
CREATE POLICY "Drivers can view all trips" ON public.trips
  FOR SELECT USING (
    has_role(auth.uid(), 'driver') OR 
    has_role(auth.uid(), 'admin')
  ) WITH CHECK (
    has_role(auth.uid(), 'admin')
  );

-- Add function to get driver details
CREATE OR REPLACE FUNCTION public.get_driver_details(driver_id UUID)
RETURNS TABLE (
  id UUID,
  serial_number INTEGER,
  driver_name TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  monthly_trips INTEGER,
  monthly_target INTEGER,
  is_available BOOLEAN,
  is_online BOOLEAN,
  profile_email TEXT,
  profile_mobile TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT 
    d.id,
    d.serial_number,
    d.driver_name,
    d.vehicle_number,
    d.vehicle_type,
    d.monthly_trips,
    d.monthly_target,
    d.is_available,
    d.is_online,
    p.email as profile_email,
    p.mobile_number as profile_mobile
  FROM public.drivers d
  LEFT JOIN public.profiles p ON d.user_id = p.id
  WHERE d.id = driver_id;
$$;

-- Create view for today's assignments
CREATE OR REPLACE VIEW public.today_assignments AS
SELECT 
  t.*,
  d.driver_name,
  d.vehicle_number,
  d.vehicle_type,
  c.company_name
FROM public.trips t
JOIN public.drivers d ON t.driver_id = d.id
JOIN public.companies c ON c.company_name = t.company_name
WHERE t.trip_date = CURRENT_DATE;

-- Grant permissions on the view
GRANT SELECT ON public.today_assignments TO authenticated;
