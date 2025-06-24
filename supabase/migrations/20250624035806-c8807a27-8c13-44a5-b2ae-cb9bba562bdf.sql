
-- Fix RLS policies for proper access control and performance
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Drivers can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can update own trip status" ON public.trips;
DROP POLICY IF EXISTS "Admins can manage all trips" ON public.trips;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete drivers" ON public.drivers;

-- Create proper RLS policies for drivers table
CREATE POLICY "Everyone can view drivers" ON public.drivers
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert drivers" ON public.drivers
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update drivers" ON public.drivers
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete drivers" ON public.drivers
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create proper RLS policies for trips table
CREATE POLICY "Everyone can view trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Drivers can update own trip status" ON public.trips
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    AND status IN ('accepted', 'declined', 'completed')
  );

CREATE POLICY "Admins can insert trips" ON public.trips
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all trips" ON public.trips
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trips" ON public.trips
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create proper RLS policies for companies table
CREATE POLICY "Everyone can view companies" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert companies" ON public.companies
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update companies" ON public.companies
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete companies" ON public.companies
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_serial_number ON public.drivers(serial_number);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_date_status ON public.trips(trip_date, status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable realtime for immediate updates
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;

-- Update monthly trips count when trip status changes to completed
CREATE OR REPLACE FUNCTION update_monthly_trips()
RETURNS TRIGGER AS $$
BEGIN
  -- If trip status changed to completed, increment monthly trips
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.drivers 
    SET monthly_trips = monthly_trips + 1
    WHERE id = NEW.driver_id;
  END IF;
  
  -- If trip status changed from completed to something else, decrement monthly trips
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE public.drivers 
    SET monthly_trips = GREATEST(monthly_trips - 1, 0)
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic monthly trips update
DROP TRIGGER IF EXISTS update_monthly_trips_trigger ON public.trips;
CREATE TRIGGER update_monthly_trips_trigger
  AFTER UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_trips();
