
-- First, let's clean up the existing static drivers data
DELETE FROM public.drivers;

-- Update the drivers table to better align with authentication
ALTER TABLE public.drivers 
DROP CONSTRAINT IF EXISTS drivers_user_id_key;

-- Add policy for admins to delete drivers
CREATE POLICY "Admins can delete drivers" ON public.drivers
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add policy for drivers to view all drivers (for fleet status)
CREATE POLICY "Drivers can view all drivers" ON public.drivers
  FOR SELECT USING (
    public.has_role(auth.uid(), 'driver') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Create a trips table if it doesn't exist for assignments
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trip_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Policy for drivers to see their own trips
CREATE POLICY "Drivers can view own trips" ON public.trips
  FOR SELECT USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- Policy for drivers to update their own trip status
CREATE POLICY "Drivers can update own trip status" ON public.trips
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- Policy for admins to manage all trips
CREATE POLICY "Admins can manage all trips" ON public.trips
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create companies table for trip assignments
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  trips_requested INTEGER DEFAULT 0,
  vehicles_assigned INTEGER DEFAULT 0,
  assignment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to view companies
CREATE POLICY "Authenticated users can view companies" ON public.companies
  FOR SELECT TO authenticated USING (true);

-- Policy for admins to manage companies
CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update the handle_new_user function to create driver record properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_serial INTEGER;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, mobile_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'mobile_number'
  );
  
  -- Determine role and insert into user_roles
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Default to driver role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'driver');
    
    -- Get next serial number for driver
    SELECT COALESCE(MAX(serial_number), 0) + 1 
    INTO next_serial 
    FROM public.drivers;
    
    -- Insert into drivers table with proper defaults
    INSERT INTO public.drivers (
      user_id, 
      serial_number, 
      monthly_trips, 
      monthly_target, 
      is_available, 
      is_online
    )
    VALUES (
      NEW.id, 
      next_serial, 
      0, 
      20, 
      true, 
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;
