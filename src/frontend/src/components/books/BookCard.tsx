import { Link } from '@tanstack/react-router';
import { Book } from '@/backend';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoverImage from './CoverImage';
import { formatTokenAmount } from '@/utils/format';
import { ShieldCheck, Copy } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const isSoldOut = book.singleCopy && !book.available;
  const uploadedCover = book.media.images.length > 0 ? book.media.images[0] : undefined;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link to="/book/$bookId" params={{ bookId: book.id }} className="block relative">
        <CoverImage 
          bookId={book.id} 
          title={book.title} 
          uploadedCover={uploadedCover}
          className="aspect-[2/3] w-full" 
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Sold Out
            </Badge>
          </div>
        )}
      </Link>
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 text-lg">
          <Link
            to="/book/$bookId"
            params={{ bookId: book.id }}
            className="hover:text-primary transition-colors"
          >
            {book.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 flex-wrap w-full">
          <Badge variant="secondary" className="font-mono">
            {formatTokenAmount(book.price)} GLDT
          </Badge>
          {!book.available && !isSoldOut && <Badge variant="destructive">Unavailable</Badge>}
          {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
          {book.singleCopy && book.available && (
            <Badge variant="outline" className="text-xs">
              <Copy className="h-3 w-3 mr-1" />
              Limited
            </Badge>
          )}
          {book.kycRestricted && (
            <Badge variant="outline" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" />
              KYC
            </Badge>
          )}
        </div>
        <Link to="/book/$bookId" params={{ bookId: book.id }} className="w-full">
          <Button size="sm" variant="outline" className="w-full" disabled={isSoldOut}>
            {isSoldOut ? 'Sold Out' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
