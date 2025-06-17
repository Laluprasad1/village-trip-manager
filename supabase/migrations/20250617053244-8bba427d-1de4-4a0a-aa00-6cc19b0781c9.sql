
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

-- Create drivers table linked to profiles
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = role_name
  );
$$;

-- Create function to handle new user registration
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
    
    -- Insert into drivers table
    INSERT INTO public.drivers (user_id, serial_number)
    VALUES (NEW.id, next_serial);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
CREATE POLICY "Drivers can view own data" ON public.drivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own status" ON public.drivers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers" ON public.drivers
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all drivers" ON public.drivers
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
