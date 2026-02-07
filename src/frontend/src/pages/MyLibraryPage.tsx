import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetUserLibrary, useGetBookContent } from '@/hooks/useLibrary';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import BookContentDialog from '@/components/library/BookContentDialog';
import CoverImage from '@/components/books/CoverImage';
import { Library, BookOpen } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function MyLibraryPage() {
  const { identity } = useInternetIdentity();
  const { libraryBooks, isLoading } = useGetUserLibrary();
  const [selectedBook, setSelectedBook] = useState<{ orderId: string; bookId: string; title: string } | null>(null);
  const { data: content, isLoading: contentLoading, error: contentError } = useGetBookContent(
    selectedBook?.orderId || '',
    selectedBook?.bookId || ''
  );

  if (!identity) {
    return (
      <PageLayout>
        <EmptyState
          icon={<Library className="h-12 w-12" />}
          title="Please log in"
          description="You need to be logged in to view your library"
        />
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </PageLayout>
    );
  }

  if (libraryBooks.length === 0) {
    return (
      <PageLayout>
        <EmptyState
          icon={<Library className="h-12 w-12" />}
          title="Your library is empty"
          description="Purchase some books to start building your digital library"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground mt-2">{libraryBooks.length} book(s) in your library</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {libraryBooks.map(({ book, order }) => (
            <Card key={`${order.orderId}-${book.id}`} className="flex flex-col">
              <CoverImage bookId={book.id} title={book.title} className="aspect-[2/3] w-full" />
              <CardHeader className="flex-1">
                <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Purchased {formatDate(order.timestamp)}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setSelectedBook({ orderId: order.orderId, bookId: book.id, title: book.title })}
                  className="w-full"
                  variant="outline"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <BookContentDialog
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
        title={selectedBook?.title || ''}
        content={content || null}
        isLoading={contentLoading}
        error={contentError}
      />
    </PageLayout>
  );
}
