import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BookContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  isLoading: boolean;
  error: Error | null;
}

export default function BookContentDialog({
  open,
  onOpenChange,
  title,
  content,
  isLoading,
  error,
}: BookContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Your purchased e-book content</DialogDescription>
        </DialogHeader>
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
