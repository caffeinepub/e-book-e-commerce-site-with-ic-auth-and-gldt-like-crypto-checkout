import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { CustomerMessage } from '@/backend';

// Submit a support message (works for guests and authenticated users)
export function useSendSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendSupportMessage(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['adminSupportInbox'] });
    },
  });
}

// Fetch authenticated user's own messages and replies
export function useGetUserMessages(includeResponses: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerMessage[]>({
    queryKey: ['userMessages', includeResponses],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserMessages(includeResponses);
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Fetch responses to a specific message
export function useGetMessageResponses(messageId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerMessage[]>({
    queryKey: ['messageResponses', messageId?.toString()],
    queryFn: async () => {
      if (!actor || messageId === null) throw new Error('Actor or messageId not available');
      return actor.getMessageResponses(messageId);
    },
    enabled: !!actor && !actorFetching && !!identity && messageId !== null,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Admin: Fetch all support messages (admin-only)
export function useGetAdminSupportInbox() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerMessage[]>({
    queryKey: ['adminSupportInbox'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Get all messages by fetching user messages with admin privileges
      // The backend will return all messages for admins
      return actor.getUserMessages(true);
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Admin: Send a reply to a support message
export function useRespondToMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, response }: { messageId: bigint; response: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.respondToMessage(messageId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportInbox'] });
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
      queryClient.invalidateQueries({ queryKey: ['messageResponses'] });
    },
  });
}
