import { Link } from '@tanstack/react-router';
import { Book } from '@/backend';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoverImage from './CoverImage';
import { formatTokenAmount } from '@/utils/format';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link to="/book/$bookId" params={{ bookId: book.id }} className="block">
        <CoverImage bookId={book.id} title={book.title} className="aspect-[2/3] w-full" />
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
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {formatTokenAmount(book.price)} GLDT
          </Badge>
          {!book.available && <Badge variant="destructive">Unavailable</Badge>}
        </div>
        <Link to="/book/$bookId" params={{ bookId: book.id }}>
          <Button size="sm" variant="outline">
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
