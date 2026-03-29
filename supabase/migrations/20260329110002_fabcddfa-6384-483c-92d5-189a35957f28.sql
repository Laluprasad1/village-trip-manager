-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  mobile_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('driver', 'admin');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'driver',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  serial_number INTEGER NOT NULL UNIQUE,
  monthly_trips INTEGER DEFAULT 0,
  monthly_target INTEGER DEFAULT 20,
  is_available BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trip_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  trips_requested INTEGER DEFAULT 0,
  vehicles_assigned INTEGER DEFAULT 0,
  assignment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = role_name
  );
$$;

-- Handle new user registration trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_serial INTEGER;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, mobile_number)
  VALUES (
    NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'mobile_number'
  );
  
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'driver');
    SELECT COALESCE(MAX(serial_number), 0) + 1 INTO next_serial FROM public.drivers;
    INSERT INTO public.drivers (user_id, serial_number, monthly_trips, monthly_target, is_available, is_online)
    VALUES (NEW.id, next_serial, 0, 20, true, true);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Authenticated can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
CREATE POLICY "Everyone can view drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers can update own status" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all drivers" ON public.drivers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete drivers" ON public.drivers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert drivers" ON public.drivers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trips
CREATE POLICY "Everyone can view trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Drivers can update own trip status" ON public.trips FOR UPDATE USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can insert trips" ON public.trips FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all trips" ON public.trips FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete trips" ON public.trips FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Everyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can insert companies" ON public.companies FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update companies" ON public.companies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete companies" ON public.companies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX idx_drivers_serial_number ON public.drivers(serial_number);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_date_status ON public.trips(trip_date, status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Realtime
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;

-- Auto-update monthly trips on completion
CREATE OR REPLACE FUNCTION update_monthly_trips()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.drivers SET monthly_trips = monthly_trips + 1 WHERE id = NEW.driver_id;
  END IF;
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE public.drivers SET monthly_trips = GREATEST(monthly_trips - 1, 0) WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monthly_trips_trigger
  AFTER UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_monthly_trips();