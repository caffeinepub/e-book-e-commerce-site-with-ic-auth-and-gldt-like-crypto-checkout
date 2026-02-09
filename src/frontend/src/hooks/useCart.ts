import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetAllBooks } from './useBooks';
import type { CartItem } from '@/backend';

export function useGetCart() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(params.bookId, params.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; kycIdentifier: string; kycProofValid: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkout(params.orderId, params.kycIdentifier, params.kycProofValid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
  });
}

export function useGetCartWithBooks() {
  const { data: cart = [] } = useGetCart();
  const { data: allBooks = [] } = useGetAllBooks();
  
  const cartWithBooks = cart.map((item) => {
    const book = allBooks.find((b) => b.id === item.bookId);
    return { item, book };
  });

  const totalAmount = cartWithBooks.reduce((sum, { item, book }) => {
    return sum + (book?.price || 0n) * item.quantity;
  }, 0n);

  return { cartWithBooks, totalAmount };
}
