import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { fetchPurchasedBookPdf } from '@/hooks/useLibrary';
import { downloadFile } from '@/utils/download';
import { toast } from 'sonner';

interface LibraryPdfDownloadButtonProps {
  orderId: string;
  bookId: string;
  title: string;
}

export default function LibraryPdfDownloadButton({
  orderId,
  bookId,
  title,
}: LibraryPdfDownloadButtonProps) {
  const { actor } = useActor();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    try {
      setIsDownloading(true);
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
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label="Download PDF"
      className="h-8 w-8"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
