import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRecoverAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.recoverAdminAccess();
    },
    onSuccess: () => {
      // Invalidate admin check so AdminRoute re-evaluates access
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
    onError: (error: any) => {
      // Map backend errors to clear English messages
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('No designated owner set') || errorMessage.includes('recovery not available')) {
        throw new Error('Admin recovery is not available. An admin has already been assigned to this store.');
      }
      
      if (errorMessage.includes('Only the designated owner')) {
        throw new Error('You are not authorized to recover admin access for this store.');
      }
      
      throw new Error('Failed to recover admin access. Please try again.');
    },
  });
}
