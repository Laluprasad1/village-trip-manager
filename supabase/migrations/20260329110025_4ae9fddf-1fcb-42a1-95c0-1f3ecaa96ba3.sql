CREATE OR REPLACE FUNCTION update_monthly_trips()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.drivers SET monthly_trips = monthly_trips + 1 WHERE id = NEW.driver_id;
  END IF;
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE public.drivers SET monthly_trips = GREATEST(monthly_trips - 1, 0) WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$;