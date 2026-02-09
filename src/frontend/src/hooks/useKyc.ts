import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '@/backend';

export interface OtpChallenge {
  phoneNumber: string;
  expiresAt: number; // timestamp
}

export interface KycVerificationState {
  method: 'phone' | 'facial' | null;
  phoneNumber?: string;
  otpSent?: boolean;
  otpVerified?: boolean;
  selfieSubmitted?: boolean;
  kycIdentifier?: string;
}

export function useStartPhoneOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Generate a mock OTP challenge (in real implementation, backend would send SMS)
      // For now, we'll use the phone number as the identifier
      const challenge: OtpChallenge = {
        phoneNumber,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes from now
      };
      
      return challenge;
    },
  });
}

export function useVerifyPhoneOtp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { phoneNumber: string; otpCode: string; expiresAt: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Check if OTP is expired
      if (Date.now() > params.expiresAt) {
        throw new Error('OTP code has expired. Please request a new code.');
      }
      
      // In a real implementation, backend would verify the OTP
      // For now, we'll accept any 6-digit code and use phone number as KYC identifier
      if (params.otpCode.length !== 6 || !/^\d+$/.test(params.otpCode)) {
        throw new Error('Invalid OTP code. Please enter a valid 6-digit code.');
      }
      
      // Submit KYC proof with phone number as identifier
      const result = await actor.submitKycProof(params.phoneNumber, true);
      
      if (result.includes('failed') || result.includes('blacklisted')) {
        throw new Error(result);
      }
      
      return { kycIdentifier: params.phoneNumber, verified: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useSubmitSelfieProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { selfieBlob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get the selfie bytes to create a unique identifier
      const selfieBytes = await params.selfieBlob.getBytes();
      
      // Create a hash-like identifier from the selfie (simplified for demo)
      // In production, this would use proper facial recognition
      const hashArray = Array.from(new Uint8Array(selfieBytes.slice(0, 16)));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const kycIdentifier = `facial-${hashHex}`;
      
      // Submit KYC proof with facial identifier
      const result = await actor.submitKycProof(kycIdentifier, true);
      
      if (result.includes('failed') || result.includes('blacklisted')) {
        throw new Error(result);
      }
      
      return { kycIdentifier, verified: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
