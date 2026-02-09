import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGetUserOrders } from './useOrders';
import { useGetAllBooks } from './useBooks';
import type { MediaContent } from '@/backend';

export function useGetUserLibrary() {
  const { data: orders = [], isLoading: ordersLoading } = useGetUserOrders();
  const { data: allBooks = [] } = useGetAllBooks();

  const libraryBooks = orders.flatMap((order) =>
    order.deliveredBookIds.map((bookId) => {
      const book = allBooks.find((b) => b.id === bookId);
      return book ? { book, order } : null;
    })
  ).filter((item): item is { book: NonNullable<typeof allBooks[0]>; order: typeof orders[0] } => item !== null);

  return { libraryBooks, isLoading: ordersLoading };
}

export function useGetBookContent(orderId: string, bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['bookContent', orderId, bookId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPurchasedBookContent(orderId, bookId);
    },
    enabled: !!actor && !isFetching && !!orderId && !!bookId,
  });
}

export function useGetPurchasedBookMedia(orderId: string, bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MediaContent>({
    queryKey: ['bookMedia', orderId, bookId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchPurchasedBookMedia(orderId, bookId);
    },
    enabled: !!actor && !isFetching && !!orderId && !!bookId,
  });
}

export async function fetchPurchasedBookPdf(
  actor: any,
  orderId: string,
  bookId: string
): Promise<Uint8Array | null> {
  if (!actor) throw new Error('Actor not available');
  
  const media = await actor.fetchPurchasedBookMedia(orderId, bookId);
  
  if (!media.pdf) {
    return null;
  }
  
  return await media.pdf.getBytes();
}
