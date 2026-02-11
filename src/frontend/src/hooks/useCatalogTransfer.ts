import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CatalogState } from '@/backend';

export function useExportCatalog() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<CatalogState> => {
      if (!actor) throw new Error('Actor not available');
      return await actor.exportCatalog();
    },
  });
}

export function useImportCatalog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catalog: CatalogState): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      await actor.importCatalog(catalog);
    },
    onSuccess: () => {
      // Invalidate all relevant caches so UI updates without reload
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['supportMessages'] });
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['bookContent'] });
    },
  });
}
