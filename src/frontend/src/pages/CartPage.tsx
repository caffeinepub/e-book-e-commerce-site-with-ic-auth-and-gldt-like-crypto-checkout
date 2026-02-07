import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useRemoveFromCart, useGetCartWithBooks } from '@/hooks/useCart';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/EmptyState';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatTokenAmount } from '@/utils/format';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { cartWithBooks, totalAmount } = useGetCartWithBooks();
  const removeFromCart = useRemoveFromCart();

  const handleRemove = async (bookId: string) => {
    try {
      await removeFromCart.mutateAsync(bookId);
      toast.success('Removed from cart');
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!identity) {
      toast.error('Please log in to checkout');
      return;
    }
    navigate({ to: '/checkout' });
  };

  if (!identity) {
    return (
      <PageLayout>
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Please log in"
          description="You need to be logged in to view your cart"
          action={
            <Button onClick={() => toast.info('Click the Login button in the header')}>
              Go to Login
            </Button>
          }
        />
      </PageLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <PageLayout>
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Your cart is empty"
          description="Add some books to your cart to get started"
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
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">{cart.length} item(s) in your cart</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartWithBooks.map(({ item, book }) => (
              <Card key={item.bookId}>
                <CardContent className="flex gap-4 p-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-muted-foreground">{book?.author || 'Unknown Author'}</p>
                    <p className="text-sm font-mono mt-2">
                      {book ? formatTokenAmount(book.price) : '0'} GLDT
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.bookId)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{cart.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-mono">{formatTokenAmount(totalAmount)} GLDT</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
