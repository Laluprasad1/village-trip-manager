
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Trip {
  id: string;
  driver_id: string;
  company_name: string;
  trip_date: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  assigned_at: string;
  created_at: string;
}

export const useTrips = () => {
  const { userRole, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      console.log('Fetching trips...');
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        throw error;
      }

      console.log('Fetched trips:', data);
      return data || [];
    },
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const updateTripStatusMutation = useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      console.log('Updating trip status:', tripId, status);
      const { error } = await supabase
        .from('trips')
        .update({ status })
        .eq('id', tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate both trips and drivers queries to update counts
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Trip status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating trip status:', error);
      toast.error('Failed to update trip status');
    }
  });

  const createTripMutation = useMutation({
    mutationFn: async (trip: Omit<Trip, 'id' | 'created_at' | 'assigned_at'>) => {
      console.log('Creating trip:', trip);
      const { error } = await supabase
        .from('trips')
        .insert([trip]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Trip assigned successfully');
    },
    onError: (error) => {
      console.error('Error creating trip:', error);
      toast.error('Failed to assign trip');
    }
  });

  const updateTripStatus = (tripId: string, status: string) => {
    updateTripStatusMutation.mutate({ tripId, status });
  };

  const createTrip = (trip: Omit<Trip, 'id' | 'created_at' | 'assigned_at'>) => {
    createTripMutation.mutate(trip);
  };

  return {
    trips,
    isLoading,
    updateTripStatus,
    createTrip,
    canManageTrips: userRole === 'admin'
  };
};
