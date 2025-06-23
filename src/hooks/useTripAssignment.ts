
import { useDrivers } from './useDrivers';
import { useTrips } from './useTrips';
import { useCompanies } from './useCompanies';
import { toast } from 'sonner';

export const useTripAssignment = () => {
  const { drivers } = useDrivers();
  const { createTrip } = useTrips();
  const { addCompany } = useCompanies();

  const assignTrips = async (companyName: string, totalTrips: number, vehiclesNeeded: number) => {
    try {
      // Get available drivers
      const availableDrivers = drivers.filter(d => d.is_online && d.is_available);
      
      if (availableDrivers.length < vehiclesNeeded) {
        toast.error(`Not enough available drivers. Need ${vehiclesNeeded}, have ${availableDrivers.length}`);
        return;
      }

      // Sort drivers by serial number for fair rotation
      const sortedDrivers = availableDrivers
        .sort((a, b) => a.serial_number - b.serial_number)
        .slice(0, vehiclesNeeded);

      // Create company entry
      await addCompany({
        name: companyName,
        trips_requested: totalTrips,
        vehicles_assigned: vehiclesNeeded,
        assignment_date: new Date().toISOString().split('T')[0]
      });

      // Create trip assignments for each selected driver
      const today = new Date().toISOString().split('T')[0];
      
      for (const driver of sortedDrivers) {
        await createTrip({
          driver_id: driver.id,
          company_name: companyName,
          trip_date: today,
          status: 'pending'
        });
      }

      toast.success(`Successfully assigned ${vehiclesNeeded} vehicles to ${companyName}`);
    } catch (error) {
      console.error('Error assigning trips:', error);
      toast.error('Failed to assign trips');
    }
  };

  return { assignTrips };
};
