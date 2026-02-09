import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetUserLibrary, useGetBookContent } from '@/hooks/useLibrary';
import PageLayout from '@/components/layout/PageLayout';
import BookContentDialog from '@/components/library/BookContentDialog';
import LibraryPdfDownloadButton from '@/components/library/LibraryPdfDownloadButton';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoverImage from '@/components/books/CoverImage';
import { BookOpen, Image, Music, Video } from 'lucide-react';
import type { Book, Order } from '@/backend';

export default function MyLibraryPage() {
  const { libraryBooks, isLoading } = useGetUserLibrary();
  const [selectedBook, setSelectedBook] = useState<{ book: Book; order: Order } | null>(null);

  const { data: content, isLoading: isLoadingContent, error: contentError } = useGetBookContent(
    selectedBook?.order.orderId || '',
    selectedBook?.book.id || ''
  );

  const handleReadBook = (book: Book, order: Order) => {
    setSelectedBook({ book, order });
  };

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
          icon={<BookOpen className="h-12 w-12" />}
          title="Your library is empty"
          description="Purchase books from the catalog to start building your collection"
          action={
            <Link to="/catalog">
              <Button>Browse Catalog</Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground mt-2">
            Your purchased e-books ({libraryBooks.length})
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {libraryBooks.map(({ book, order }) => {
            const hasMedia = book.media.pdf || book.media.images.length > 0 || book.media.audio.length > 0 || book.media.video.length > 0;
            
            return (
              <div key={`${order.orderId}-${book.id}`} className="relative">
                <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative">
                    <CoverImage bookId={book.id} title={book.title} className="aspect-[2/3] w-full" />
                    {book.media.pdf && (
                      <LibraryPdfDownloadButton
                        orderId={order.orderId}
                        bookId={book.id}
                        bookTitle={book.title}
                      />
                    )}
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </CardHeader>
                  <CardFooter className="flex flex-col items-start gap-3">
                    {hasMedia && (
                      <div className="flex gap-1 flex-wrap w-full">
                        {book.media.images.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            {book.media.images.length}
                          </Badge>
                        )}
                        {book.media.audio.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Music className="h-3 w-3 mr-1" />
                            {book.media.audio.length}
                          </Badge>
                        )}
                        {book.media.video.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            {book.media.video.length}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReadBook(book, order)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBook && (
        <BookContentDialog
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          title={selectedBook.book.title}
          orderId={selectedBook.order.orderId}
          bookId={selectedBook.book.id}
          content={content || null}
          isLoadingContent={isLoadingContent}
          contentError={contentError}
        />
      )}
    </PageLayout>
  );
}
