import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface DocumentKycSubmission {
  documentType: 'id' | 'birth-certificate';
  documentNumber: string;
  kycIdentifier: string;
}

export function useSubmitDocumentKyc() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DocumentKycSubmission) => {
      if (!actor) throw new Error('Actor not available');

      // Submit KYC proof with document-based identifier
      const result = await actor.submitKycProof(params.kycIdentifier, true);

      // Check for backend error messages
      if (result.includes('failed') || result.includes('blacklisted') || result.includes('not valid')) {
        throw new Error(result);
      }

      return { kycIdentifier: params.kycIdentifier, verified: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
