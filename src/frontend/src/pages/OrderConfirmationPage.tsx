import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '@/hooks/useOrders';
import { useGetBook } from '@/hooks/useBooks';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Library } from 'lucide-react';
import { formatTokenAmount } from '@/utils/format';
import { formatDate } from '@/utils/format';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Order not found</h2>
          <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate({ to: '/catalog' })} className="mt-6">
            Back to Catalog
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="lg">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center animate-in fade-in zoom-in duration-500">
            <img 
              src="/assets/generated/thanks-for-your-purchase-icon.dim_256x256.png" 
              alt="Thanks for your purchase icon"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Thanks for your purchase!</h1>
          <p className="text-muted-foreground">
            Your order was successful. Your books are now available in your library.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDate(order.timestamp)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Items Purchased</h3>
              {order.items.map((item) => (
                <OrderItem key={item.bookId} bookId={item.bookId} />
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid</span>
              <span className="font-mono">{formatTokenAmount(order.totalAmount)} GLDT</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate({ to: '/library' })} size="lg">
            <Library className="mr-2 h-4 w-4" />
            Go to My Library
          </Button>
          <Button onClick={() => navigate({ to: '/catalog' })} variant="outline" size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

function OrderItem({ bookId }: { bookId: string }) {
  const { data: book } = useGetBook(bookId);

  return (
    <div className="flex justify-between">
      <div>
        <p className="font-medium">{book?.title || 'Loading...'}</p>
        <p className="text-sm text-muted-foreground">{book?.author || ''}</p>
      </div>
      <p className="font-mono">{book ? formatTokenAmount(book.price) : '0'} GLDT</p>
    </div>
  );
}
