import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { footprintService } from '@/services/footprint.service';
import { FootprintData } from '@/types/footprint.types';

export const useFootprint = (employeeId?: number) => {
  const queryClient = useQueryClient();

  const { data: footprints, isLoading } = useQuery({
    queryKey: ['footprints', employeeId],
    queryFn: () => footprintService.getMyFootprints(employeeId!),
    enabled: !!employeeId,
  });

  const calculateMutation = useMutation({
    mutationFn: (data: FootprintData) => footprintService.calculate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footprints'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => footprintService.deleteFootprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footprints'] });
    },
  });

  return {
    footprints,
    isLoading,
    calculate: calculateMutation.mutate,
    isCalculating: calculateMutation.isPending,
    calculationError: calculateMutation.error,
    deleteFootprint: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};