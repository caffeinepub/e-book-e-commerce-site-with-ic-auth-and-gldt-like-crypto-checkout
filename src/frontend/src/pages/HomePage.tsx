import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useGetAvailableBooks } from '@/hooks/useBooks';
import BookCard from '@/components/books/BookCard';
import PageLayout from '@/components/layout/PageLayout';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { data: books = [], isLoading } = useGetAvailableBooks();
  const featuredBooks = books.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Discover Digital Books
                <span className="block text-primary mt-2">Powered by Crypto</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Browse our curated collection of e-books and purchase instantly with GLDT tokens. Your
                library, secured on the blockchain.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalog">
                  <Button size="lg">
                    Browse Catalog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/library">
                  <Button size="lg" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Library
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-[8/3] lg:aspect-auto lg:h-[400px] rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/hero-reading-nook.dim_1600x600.png"
                alt="Cozy reading nook with comfortable seating and shelves of books"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <PageLayout>
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Books</h2>
              <p className="text-muted-foreground mt-2">Handpicked selections from our catalog</p>
            </div>
            <Link to="/catalog">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No books available yet. Check back soon!</p>
            </div>
          )}
        </section>
      </PageLayout>
    </div>
  );
}
