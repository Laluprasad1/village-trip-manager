
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Driver {
  id: string;
  user_id: string;
  serial_number: number;
  monthly_trips: number;
  monthly_target: number;
  is_available: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
    mobile_number: string;
  };
}

export const useDrivers = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      console.log('Fetching drivers with profiles...');
      
      // Get drivers with their profiles in a single query using join
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select(`
          *,
          profile:profiles!drivers_user_id_fkey(
            full_name,
            email,
            mobile_number
          )
        `)
        .order('serial_number');

      if (driversError) {
        console.error('Error fetching drivers:', driversError);
        throw driversError;
      }

      console.log('Fetched drivers:', driversData);
      return driversData || [];
    },
    enabled: !!userRole,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ driverId, updates }: { driverId: string; updates: Partial<Driver> }) => {
      console.log('Updating driver:', driverId, updates);
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
    },
    onError: (error) => {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver');
    }
  });

  const deleteDriverMutation = useMutation({
    mutationFn: async (driverId: string) => {
      console.log('Deleting driver:', driverId);
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver removed successfully');
    },
    onError: (error) => {
      console.error('Error deleting driver:', error);
      toast.error('Failed to remove driver');
    }
  });

  const updateDriver = (driverId: string, updates: Partial<Driver>) => {
    updateDriverMutation.mutate({ driverId, updates });
  };

  const deleteDriver = (driverId: string) => {
    if (userRole !== 'admin') {
      toast.error('Only admins can remove drivers');
      return;
    }
    deleteDriverMutation.mutate(driverId);
  };

  const toggleAvailability = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      updateDriver(driverId, { is_online: !driver.is_online });
    }
  };

  return {
    drivers,
    isLoading,
    error,
    updateDriver,
    deleteDriver,
    toggleAvailability,
    canDelete: userRole === 'admin'
  };
};
