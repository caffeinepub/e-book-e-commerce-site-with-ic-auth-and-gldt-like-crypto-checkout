import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRecoverAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.recoverAdminAccess();
      } catch (error: any) {
        // Map backend errors to clear English messages
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('No designated owner set') || errorMessage.includes('recovery not available')) {
          throw new Error('Admin recovery is not configured for this store. The first user to deploy this canister was automatically assigned as admin. If you need admin access, please contact the store owner.');
        }
        
        if (errorMessage.includes('Only the designated owner')) {
          throw new Error('You are not authorized to recover admin access. Only the designated owner principal can perform this action.');
        }
        
        throw new Error('Failed to recover admin access: ' + errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate admin check so AdminRoute re-evaluates access
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
