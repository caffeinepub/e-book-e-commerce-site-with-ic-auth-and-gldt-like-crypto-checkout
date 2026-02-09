import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Phone, Camera, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import SelfieCapture from './SelfieCapture';
import { useStartPhoneOtp, useVerifyPhoneOtp, useSubmitSelfieProof } from '@/hooks/useKyc';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';

interface KycVerificationCardProps {
  onVerificationComplete: (kycIdentifier: string) => void;
  isCheckoutProcessing?: boolean;
}

export default function KycVerificationCard({
  onVerificationComplete,
  isCheckoutProcessing,
}: KycVerificationCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<'phone' | 'facial'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verifiedIdentifier, setVerifiedIdentifier] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const startPhoneOtp = useStartPhoneOtp();
  const verifyPhoneOtp = useVerifyPhoneOtp();
  const submitSelfieProof = useSubmitSelfieProof();

  // Timer countdown effect
  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    // Basic phone validation
    if (!/^\+?[\d\s-()]+$/.test(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      const challenge = await startPhoneOtp.mutateAsync(phoneNumber);
      setOtpSent(true);
      setOtpExpiresAt(challenge.expiresAt);
      setTimeRemaining(30 * 60); // 30 minutes in seconds
      toast.success('Verification code sent! (Demo: use any 6-digit code)');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (!otpExpiresAt) {
      toast.error('Please request a new code');
      return;
    }

    try {
      const result = await verifyPhoneOtp.mutateAsync({
        phoneNumber,
        otpCode,
        expiresAt: otpExpiresAt,
      });
      setVerificationComplete(true);
      setVerifiedIdentifier(result.kycIdentifier);
      onVerificationComplete(result.kycIdentifier);
      toast.success('Phone verification successful!');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    }
  };

  const handleSelfieCapture = (file: File) => {
    setSelfieFile(file);
  };

  const handleSubmitSelfie = async () => {
    if (!selfieFile) {
      toast.error('Please capture or upload a selfie');
      return;
    }

    try {
      // Convert file to bytes
      const arrayBuffer = await selfieFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const selfieBlob = ExternalBlob.fromBytes(bytes);

      const result = await submitSelfieProof.mutateAsync({ selfieBlob });
      setVerificationComplete(true);
      setVerifiedIdentifier(result.kycIdentifier);
      onVerificationComplete(result.kycIdentifier);
      toast.success('Facial verification successful!');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
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
            Your cart contains KYC-restricted books. Please verify your identity using one of the methods below. This ensures you can only purchase one copy per person.
          </AlertDescription>
        </Alert>

        <Tabs value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as 'phone' | 'facial')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" disabled={verificationComplete || isCheckoutProcessing}>
              <Phone className="mr-2 h-4 w-4" />
              Phone Verification
            </TabsTrigger>
            <TabsTrigger value="facial" disabled={verificationComplete || isCheckoutProcessing}>
              <Camera className="mr-2 h-4 w-4" />
              Facial Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={otpSent || startPhoneOtp.isPending || isCheckoutProcessing}
                />
              </div>

              {!otpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={startPhoneOtp.isPending || !phoneNumber.trim() || isCheckoutProcessing}
                  className="w-full"
                >
                  {startPhoneOtp.isPending ? 'Sending...' : 'Send Verification Code'}
                </Button>
              ) : (
                <>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      A verification code has been sent to your phone. The code will expire in 30 minutes.
                      {timeRemaining > 0 && (
                        <span className="block mt-1 font-semibold">
                          Time remaining: {formatTime(timeRemaining)}
                        </span>
                      )}
                      {timeRemaining === 0 && (
                        <span className="block mt-1 font-semibold text-destructive">
                          Code expired. Please request a new code.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={verifyPhoneOtp.isPending || timeRemaining === 0 || isCheckoutProcessing}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={verifyPhoneOtp.isPending || otpCode.length !== 6 || timeRemaining === 0 || isCheckoutProcessing}
                      className="flex-1"
                    >
                      {verifyPhoneOtp.isPending ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    <Button
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setOtpExpiresAt(null);
                        setTimeRemaining(0);
                      }}
                      variant="outline"
                      disabled={startPhoneOtp.isPending || verifyPhoneOtp.isPending || isCheckoutProcessing}
                    >
                      Request New Code
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="facial" className="space-y-4">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Please capture a clear photo of your face. This will be used to verify your identity and prevent duplicate purchases.
              </AlertDescription>
            </Alert>

            <SelfieCapture
              onCapture={handleSelfieCapture}
              isSubmitting={submitSelfieProof.isPending || isCheckoutProcessing}
            />

            {selfieFile && (
              <Button
                onClick={handleSubmitSelfie}
                disabled={submitSelfieProof.isPending || isCheckoutProcessing}
                className="w-full"
              >
                {submitSelfieProof.isPending ? 'Verifying...' : 'Submit Verification'}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
