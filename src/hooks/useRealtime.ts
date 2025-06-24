
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create unique channel names with timestamps to avoid conflicts
    const timestamp = Date.now();
    
    // Subscribe to trips table changes
    const tripsChannel = supabase
      .channel(`trips-changes-${timestamp}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips'
        },
        () => {
          // Invalidate and refetch trips data
          queryClient.invalidateQueries({ queryKey: ['trips'] });
        }
      )
      .subscribe();

    // Subscribe to drivers table changes
    const driversChannel = supabase
      .channel(`drivers-changes-${timestamp}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        () => {
          // Invalidate and refetch drivers data
          queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
      )
      .subscribe();

    // Subscribe to companies table changes
    const companiesChannel = supabase
      .channel(`companies-changes-${timestamp}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        () => {
          // Invalidate and refetch companies data
          queryClient.invalidateQueries({ queryKey: ['companies'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tripsChannel);
      supabase.removeChannel(driversChannel);
      supabase.removeChannel(companiesChannel);
    };
  }, [queryClient]);
};
