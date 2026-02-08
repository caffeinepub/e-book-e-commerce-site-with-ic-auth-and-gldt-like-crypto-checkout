import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { fetchPurchasedBookPdf } from '@/hooks/useLibrary';
import { downloadFile } from '@/utils/download';
import { toast } from 'sonner';

interface BookContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  orderId: string;
  bookId: string;
  hasPdf: boolean;
  content: string | null;
  isLoading: boolean;
  error: Error | null;
}

export default function BookContentDialog({
  open,
  onOpenChange,
  title,
  orderId,
  bookId,
  hasPdf,
  content,
  isLoading,
  error,
}: BookContentDialogProps) {
  const { actor } = useActor();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const pdfBytes = await fetchPurchasedBookPdf(actor, orderId, bookId);

      if (!pdfBytes) {
        toast.error('No PDF available for this book');
        return;
      }

      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      downloadFile(pdfBytes, filename, 'application/pdf');
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('PDF download error:', error);
      if (error.message?.includes('Unauthorized') || error.message?.includes('not included')) {
        toast.error('You do not have permission to download this PDF');
      } else {
        toast.error('Failed to download PDF. Please try again.');
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Your purchased e-book content</DialogDescription>
        </DialogHeader>
        
        {hasPdf && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load content. Please try again.</AlertDescription>
          </Alert>
        )}
        {content && (
          <ScrollArea className="h-[60vh] rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{content}</pre>
            </div>
          </ScrollArea>
        )}
        {!isLoading && !error && !content && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No content available for this book.</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
