import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useMintTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { to: Principal; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.mintTokens(params.to, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
