
import { useState, useEffect } from 'react';
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
      console.log('Fetching drivers...');
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          profiles!inner(
            full_name,
            email,
            mobile_number
          )
        `)
        .order('serial_number');

      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }

      return data?.map(driver => ({
        ...driver,
        profile: driver.profiles
      })) || [];
    },
    enabled: !!userRole
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
