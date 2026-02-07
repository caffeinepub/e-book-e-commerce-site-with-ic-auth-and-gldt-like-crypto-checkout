import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBook } from '@/hooks/useBooks';
import { useAddToCart } from '@/hooks/useCart';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CoverImage from '@/components/books/CoverImage';
import { formatTokenAmount } from '@/utils/format';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function BookDetailsPage() {
  const { bookId } = useParams({ from: '/book/$bookId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: book, isLoading } = useGetBook(bookId);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please log in to add items to your cart');
      return;
    }

    try {
      await addToCart.mutateAsync({ bookId, quantity: 1n });
      toast.success('Added to cart!');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-[2/3] bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!book) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Book not found</h2>
          <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist.</p>
          <Button onClick={() => navigate({ to: '/catalog' })} className="mt-6">
            Back to Catalog
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/catalog' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <div>
            <CoverImage bookId={book.id} title={book.title} className="aspect-[2/3] w-full max-w-md mx-auto" />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{book.title}</h1>
              <p className="text-xl text-muted-foreground mt-2">by {book.author}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg font-mono px-4 py-2">
                {formatTokenAmount(book.price)} GLDT
              </Badge>
              {!book.available && <Badge variant="destructive">Unavailable</Badge>}
            </div>

            <Separator />

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.title} by {book.author} - A captivating digital book available for purchase with
                  GLDT tokens. Add to your library today and enjoy instant access to your content.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!book.available || addToCart.isPending}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
