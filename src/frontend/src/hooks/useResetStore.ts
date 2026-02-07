import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useResetStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetStore();
    },
    onSuccess: () => {
      // Invalidate all relevant caches to reflect clean state
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['adminSupportInbox'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admins')) {
        throw new Error('You do not have permission to reset the store.');
      }
      
      throw new Error('Failed to reset store. Please try again.');
    },
  });
}
