import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubmitDocumentKyc } from '@/hooks/useKyc';
import { deriveKycIdentifier, validateDocumentNumber } from '@/utils/kyc';
import { toast } from 'sonner';

interface KycVerificationCardProps {
  onVerificationComplete: (kycIdentifier: string) => void;
  isCheckoutProcessing?: boolean;
}

export default function KycVerificationCard({
  onVerificationComplete,
  isCheckoutProcessing,
}: KycVerificationCardProps) {
  const [documentType, setDocumentType] = useState<'id' | 'birth-certificate'>('id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verifiedIdentifier, setVerifiedIdentifier] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const submitDocumentKyc = useSubmitDocumentKyc();

  const handleSubmit = async () => {
    setValidationError(null);

    // Client-side validation
    const trimmedNumber = documentNumber.trim();
    const validationResult = validateDocumentNumber(trimmedNumber);
    
    if (!validationResult.isValid) {
      setValidationError(validationResult.error || 'Please enter a valid document number');
      toast.error(validationResult.error || 'Please enter a valid document number');
      return;
    }

    try {
      // Derive stable KYC identifier
      const kycIdentifier = deriveKycIdentifier(documentType, trimmedNumber);
      
      // Submit to backend
      const result = await submitDocumentKyc.mutateAsync({
        documentType,
        documentNumber: trimmedNumber,
        kycIdentifier,
      });

      setVerificationComplete(true);
      setVerifiedIdentifier(kycIdentifier);
      onVerificationComplete(kycIdentifier);
      toast.success('Identity verification successful!');
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed. Please try again.';
      setValidationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (verificationComplete && verifiedIdentifier) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Identity Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Your identity has been successfully verified. You can now complete your purchase.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Identity Verification Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Your cart contains KYC-restricted books. Please verify your identity by providing your ID number or birth certificate number. After purchasing one KYC-restricted book, the same verified identity cannot be used to purchase other KYC-restricted books in the future.
          </AlertDescription>
        </Alert>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Document Type</Label>
            <RadioGroup
              value={documentType}
              onValueChange={(value) => {
                setDocumentType(value as 'id' | 'birth-certificate');
                setValidationError(null);
              }}
              disabled={submitDocumentKyc.isPending || isCheckoutProcessing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="id" id="id" />
                <Label htmlFor="id" className="font-normal cursor-pointer">
                  ID Number
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="birth-certificate" id="birth-certificate" />
                <Label htmlFor="birth-certificate" className="font-normal cursor-pointer">
                  Birth Certificate Number
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-number">
              {documentType === 'id' ? 'ID Number' : 'Birth Certificate Number'}
            </Label>
            <Input
              id="document-number"
              type="text"
              placeholder={
                documentType === 'id'
                  ? 'Enter your ID number'
                  : 'Enter your birth certificate number'
              }
              value={documentNumber}
              onChange={(e) => {
                setDocumentNumber(e.target.value);
                setValidationError(null);
              }}
              disabled={submitDocumentKyc.isPending || isCheckoutProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Must contain at least 5 characters
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={
              submitDocumentKyc.isPending ||
              isCheckoutProcessing ||
              !documentNumber.trim()
            }
            className="w-full"
          >
            {submitDocumentKyc.isPending ? 'Verifying...' : 'Verify Identity'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
