import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '@/backend';
import type { Book, ReEnableBooksResult } from '@/backend';

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
      singleCopy: boolean;
      kycRestricted: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(
        params.id,
        params.title,
        params.author,
        params.price,
        params.content,
        params.singleCopy,
        params.kycRestricted
      );
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
      singleCopy: boolean;
      kycRestricted: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(
        params.id,
        params.title,
        params.author,
        params.price,
        params.available,
        params.singleCopy,
        params.kycRestricted
      );
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

export function useUploadBookImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; imageBytes: Uint8Array; onProgress?: (percentage: number) => void }) => {
      if (!actor) throw new Error('Actor not available');
      
      const bytes = new Uint8Array(params.imageBytes.buffer.slice(params.imageBytes.byteOffset, params.imageBytes.byteOffset + params.imageBytes.byteLength)) as Uint8Array<ArrayBuffer>;
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      
      return actor.uploadBookImage(params.bookId, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useRemoveBookImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; imageIndex: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBookImage(params.bookId, BigInt(params.imageIndex));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useUploadBookAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; audioBytes: Uint8Array; onProgress?: (percentage: number) => void }) => {
      if (!actor) throw new Error('Actor not available');
      
      const bytes = new Uint8Array(params.audioBytes.buffer.slice(params.audioBytes.byteOffset, params.audioBytes.byteOffset + params.audioBytes.byteLength)) as Uint8Array<ArrayBuffer>;
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      
      return actor.uploadBookAudio(params.bookId, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useRemoveBookAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; audioIndex: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBookAudio(params.bookId, BigInt(params.audioIndex));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useUploadBookVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; videoBytes: Uint8Array; onProgress?: (percentage: number) => void }) => {
      if (!actor) throw new Error('Actor not available');
      
      const bytes = new Uint8Array(params.videoBytes.buffer.slice(params.videoBytes.byteOffset, params.videoBytes.byteOffset + params.videoBytes.byteLength)) as Uint8Array<ArrayBuffer>;
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      
      return actor.uploadBookVideo(params.bookId, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useRemoveBookVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookId: string; videoIndex: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBookVideo(params.bookId, BigInt(params.videoIndex));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
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

export function useReEnableBooksByIdentifier() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ReEnableBooksResult, Error, string>({
    mutationFn: async (identifier: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reEnableBooksByIdentifier(identifier);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableBooks'] });
      queryClient.invalidateQueries({ queryKey: ['allBooks'] });
    },
  });
}
