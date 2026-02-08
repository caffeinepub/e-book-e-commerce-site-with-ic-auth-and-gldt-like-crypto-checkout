import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '@/backend';
import type { Book } from '@/backend';

export function useGetAvailableBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['availableBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['allBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBook(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Book>({
    queryKey: ['book', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBook(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      author: string;
      price: bigint;
      content: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(params.id, params.title, params.author, params.price, params.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      author: string;
      price: bigint;
      available: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(params.id, params.title, params.author, params.price, params.available);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
    },
  });
}

export function useUpdateBookContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookContent(params.id, params.content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
    },
  });
}

export function useUploadBookPdf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; pdfBytes: Uint8Array; onProgress?: (percentage: number) => void }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Cast to the expected type
      const bytes = new Uint8Array(params.pdfBytes.buffer.slice(params.pdfBytes.byteOffset, params.pdfBytes.byteOffset + params.pdfBytes.byteLength)) as Uint8Array<ArrayBuffer>;
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      
      return actor.uploadBookPdf(params.bookId, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useRemoveBookPdf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBookPdf(bookId);
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
    },
  });
}
