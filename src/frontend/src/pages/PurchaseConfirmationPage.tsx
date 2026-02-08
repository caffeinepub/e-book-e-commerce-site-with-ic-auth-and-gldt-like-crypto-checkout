import { useParams, useNavigate } from '@tanstack/react-router';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Library, FileText, ShoppingBag } from 'lucide-react';

export default function PurchaseConfirmationPage() {
  const { orderId } = useParams({ from: '/purchase-confirmation/$orderId' });
  const navigate = useNavigate();

  return (
    <PageLayout maxWidth="md">
      <div className="space-y-8 py-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-success/10 p-6">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Purchase Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Your order has been successfully processed. Your books are ready to read.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate({ to: '/library' })}
              className="w-full"
              size="lg"
            >
              <Library className="mr-2 h-5 w-5" />
              Go to My Library
            </Button>
            <Button
              onClick={() => navigate({ to: '/order/$orderId', params: { orderId } })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              View Order Details
            </Button>
            <Button
              onClick={() => navigate({ to: '/catalog' })}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
