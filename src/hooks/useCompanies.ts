
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  trips_requested: number;
  vehicles_assigned: number;
  assignment_date: string;
  created_at: string;
}

export const useCompanies = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('Fetching companies...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user
  });

  const addCompanyMutation = useMutation({
    mutationFn: async (company: Omit<Company, 'id' | 'created_at'>) => {
      console.log('Adding company:', company);
      const { error } = await supabase
        .from('companies')
        .insert([company]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company added successfully');
    },
    onError: (error) => {
      console.error('Error adding company:', error);
      toast.error('Failed to add company');
    }
  });

  const addCompany = (company: Omit<Company, 'id' | 'created_at'>) => {
    addCompanyMutation.mutate(company);
  };

  return {
    companies,
    isLoading,
    addCompany
  };
};
