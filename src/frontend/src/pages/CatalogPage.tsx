import { useState, useMemo } from 'react';
import { useGetAvailableBooks } from '@/hooks/useBooks';
import BookCard from '@/components/books/BookCard';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CatalogPage() {
  const { data: books = [], isLoading, isError, error } = useGetAvailableBooks();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Book Catalog</h1>
          <p className="text-muted-foreground mt-2">Browse our collection of digital books</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load books. Please check your connection and try refreshing the page.
              {error instanceof Error && ` Error: ${error.message}`}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title="No books found"
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'No books are currently available in the catalog'
            }
          />
        )}
      </div>
    </PageLayout>
  );
}
