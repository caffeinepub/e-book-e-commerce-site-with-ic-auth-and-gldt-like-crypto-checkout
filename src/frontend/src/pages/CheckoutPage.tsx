import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCartWithBooks } from '@/hooks/useCart';
import { useGetBalance } from '@/hooks/useBalance';
import { useCheckout } from '@/hooks/useCart';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useAuthz';
import PageLayout from '@/components/layout/PageLayout';
import LoginButton from '@/components/auth/LoginButton';
import KycVerificationCard from '@/components/checkout/KycVerificationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EmptyState from '@/components/EmptyState';
import { ShoppingCart, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatTokenAmount } from '@/utils/format';
import { generateOrderId } from '@/utils/orderId';
import { mapKycError } from '@/utils/kycRestrictionErrors';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { cartWithBooks, totalAmount } = useGetCartWithBooks();
  const { data: balance = 0n } = useGetBalance();
  const { data: userProfile } = useGetCallerUserProfile();
  const checkout = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycIdentifier, setKycIdentifier] = useState('');

  const hasInsufficientBalance = balance < totalAmount;
  const hasKycRestrictedBooks = cartWithBooks.some(({ book }) => book?.kycRestricted);
  const hasSingleCopyIssue = cartWithBooks.some(
    ({ item, book }) => book?.singleCopy && item.quantity > 1n
  );

  const canProceed = !hasInsufficientBalance && !hasSingleCopyIssue && 
    (!hasKycRestrictedBooks || kycVerified);

  const handleKycVerificationComplete = (identifier: string) => {
    setKycVerified(true);
    setKycIdentifier(identifier);
  };

  const handleCheckout = async () => {
    if (!identity) {
      toast.error('Please log in to complete checkout');
      return;
    }

    if (hasInsufficientBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (hasSingleCopyIssue) {
      toast.error('Please fix cart issues before proceeding');
      return;
    }

    if (hasKycRestrictedBooks && !kycVerified) {
      toast.error('Please complete identity verification for KYC-restricted books');
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);
    const orderId = generateOrderId();

    try {
      const finalKycIdentifier = hasKycRestrictedBooks ? kycIdentifier : (userProfile?.name || '');
      const [message] = await checkout.mutateAsync({ 
        orderId, 
        kycIdentifier: finalKycIdentifier,
        kycProofValid: hasKycRestrictedBooks ? kycVerified : true,
      });
      
      toast.success('Order placed successfully!');
      navigate({ to: '/purchase-confirmation/$orderId', params: { orderId } });
    } catch (error: any) {
      console.error('Checkout failed:', error);
      let errorMessage = error.message || 'Checkout failed. Please try again.';
      
      // Map backend errors to user-friendly messages
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid or expired proof')) {
        errorMessage = 'Your verification has expired. Please complete verification again.';
        setKycVerified(false);
        setKycIdentifier('');
      } else if (errorMessage.includes('blacklisted')) {
        errorMessage = 'Your account has been blacklisted and cannot make purchases. Please contact support.';
      } else if (errorMessage.includes('sold out') || errorMessage.includes('single copy')) {
        errorMessage = 'One or more books in your cart are sold out. Please remove them and try again.';
      } else {
        // Use the KYC restriction error mapper for the new restriction
        errorMessage = mapKycError(errorMessage);
      }
      
      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!identity) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/cart' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Login Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">
                You need to be logged in to complete your checkout
              </p>
              <div className="flex justify-center pt-2">
                <LoginButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (cartWithBooks.length === 0) {
    return (
      <PageLayout>
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Your cart is empty"
          description="Add some books to your cart before checking out"
          action={
            <Button onClick={() => navigate({ to: '/catalog' })}>Browse Catalog</Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="lg">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/cart' })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">Review your order and complete payment</p>
        </div>

        {checkoutError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Checkout Failed</AlertTitle>
            <AlertDescription>{checkoutError}</AlertDescription>
          </Alert>
        )}

        {hasSingleCopyIssue && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cart Issue</AlertTitle>
            <AlertDescription>
              One or more single-copy books have invalid quantities. Please return to cart and fix this issue.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartWithBooks.map(({ item, book }) => (
                  <div key={item.bookId} className="flex justify-between">
                    <div>
                      <p className="font-medium">{book?.title || 'Unknown Book'}</p>
                      <p className="text-sm text-muted-foreground">{book?.author || 'Unknown Author'}</p>
                      {book?.singleCopy && (
                        <p className="text-xs text-muted-foreground mt-1">Limited Edition (Single Copy)</p>
                      )}
                      {book?.kycRestricted && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          KYC Required
                        </p>
                      )}
                    </div>
                    <p className="font-mono">{book ? formatTokenAmount(book.price) : '0'} GLDT</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {hasKycRestrictedBooks && (
              <KycVerificationCard
                onVerificationComplete={handleKycVerificationComplete}
                isCheckoutProcessing={isProcessing}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="text-2xl font-mono font-bold">{formatTokenAmount(balance)} GLDT</span>
                </div>
                {hasInsufficientBalance && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance. You need {formatTokenAmount(totalAmount - balance)} more GLDT.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{cartWithBooks.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-mono">{formatTokenAmount(totalAmount)} GLDT</span>
                </div>
                {!hasInsufficientBalance && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance After</span>
                      <span className="font-mono">{formatTokenAmount(balance - totalAmount)} GLDT</span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCheckout}
                  disabled={!canProceed || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
