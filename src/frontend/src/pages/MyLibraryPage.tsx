import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetUserLibrary, useGetBookContent } from '@/hooks/useLibrary';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import BookContentDialog from '@/components/library/BookContentDialog';
import CoverImage from '@/components/books/CoverImage';
import LibraryPdfDownloadButton from '@/components/library/LibraryPdfDownloadButton';
import { Library, BookOpen } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function MyLibraryPage() {
  const { identity } = useInternetIdentity();
  const { libraryBooks, isLoading } = useGetUserLibrary();
  const [selectedBook, setSelectedBook] = useState<{ 
    orderId: string; 
    bookId: string; 
    title: string;
    hasPdf: boolean;
  } | null>(null);
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
          description="Purchase books from the catalog to start reading"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Library</h1>
          <p className="text-muted-foreground">Your purchased e-books</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryBooks.map(({ book, order }) => (
            <Card key={`${order.orderId}-${book.id}`} className="flex flex-col">
              <CardHeader>
                <div className="relative">
                  <CoverImage 
                    bookId={book.id} 
                    title={book.title}
                    className="w-full h-48 object-cover rounded-md mb-4" 
                  />
                  {book.pdf && (
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md">
                      <LibraryPdfDownloadButton
                        orderId={order.orderId}
                        bookId={book.id}
                        title={book.title}
                      />
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                <p className="text-xs text-muted-foreground">
                  Purchased: {formatDate(order.timestamp)}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() =>
                    setSelectedBook({
                      orderId: order.orderId,
                      bookId: book.id,
                      title: book.title,
                      hasPdf: !!book.pdf,
                    })
                  }
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {selectedBook && (
        <BookContentDialog
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          title={selectedBook.title}
          orderId={selectedBook.orderId}
          bookId={selectedBook.bookId}
          hasPdf={selectedBook.hasPdf}
          content={content || null}
          isLoading={contentLoading}
          error={contentError}
        />
      )}
    </PageLayout>
  );
}
