import { useState } from 'react';
import { useReEnableBooksByIdentifier } from '@/hooks/useBooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import type { ReEnableBooksResult } from '@/backend';

export default function ReEnableBooksByIdentifierCard() {
  const [identifier, setIdentifier] = useState('');
  const [result, setResult] = useState<ReEnableBooksResult | null>(null);
  const reEnableMutation = useReEnableBooksByIdentifier();

  const handleReEnable = async () => {
    if (!identifier.trim()) return;

    try {
      const res = await reEnableMutation.mutateAsync(identifier.trim());
      setResult(res);
      setIdentifier('');
    } catch (error) {
      // Error is handled by mutation
      setResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && identifier.trim() && !reEnableMutation.isPending) {
      handleReEnable();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Re-enable Books by Identifier
        </CardTitle>
        <CardDescription>
          Enter a book title to make matching books available on the public site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && result.updatedCount > 0n && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              Books Re-enabled Successfully
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300 space-y-2">
              <p>
                <strong>{Number(result.updatedCount)}</strong> book(s) were made available.
              </p>
              {result.updatedBooks.length > 0 && (
                <div>
                  <p className="font-semibold">Updated books:</p>
                  <ul className="list-disc list-inside ml-2">
                    {result.updatedBooks.map((bookId) => (
                      <li key={bookId} className="font-mono text-sm">
                        {bookId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.skippedBooks.length > 0 && (
                <div className="pt-2">
                  <p className="font-semibold">Skipped (sold out):</p>
                  <ul className="list-disc list-inside ml-2">
                    {result.skippedBooks.map((bookId) => (
                      <li key={bookId} className="font-mono text-sm">
                        {bookId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result && result.updatedCount === 0n && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Books Found</AlertTitle>
            <AlertDescription>
              No matching books were found or all matching books are already available.
            </AlertDescription>
          </Alert>
        )}

        {reEnableMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Re-enable Failed</AlertTitle>
            <AlertDescription>
              {reEnableMutation.error instanceof Error
                ? reEnableMutation.error.message
                : 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="book-identifier">Book Title or Identifier</Label>
          <Input
            id="book-identifier"
            placeholder="Enter exact book title (e.g., CRYPTO BEGINNER'S GUIDE: HOW TO BUY GOLD TOKENS / GLDT AND MORE FROM SCRATCH)"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={reEnableMutation.isPending}
          />
          <p className="text-sm text-muted-foreground">
            Enter the exact title of the book you want to make available. The search is case-insensitive.
          </p>
        </div>

        <Button
          onClick={handleReEnable}
          disabled={!identifier.trim() || reEnableMutation.isPending}
          size="lg"
        >
          {reEnableMutation.isPending ? 'Re-enabling...' : 'Re-enable Books'}
        </Button>
      </CardContent>
    </Card>
  );
}
