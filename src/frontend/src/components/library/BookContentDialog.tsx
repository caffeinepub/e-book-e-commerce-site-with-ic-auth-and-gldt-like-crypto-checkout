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
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Download, Loader2, FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import { useGetPurchasedBookMedia } from '@/hooks/useLibrary';
import { downloadFromUrl } from '@/utils/download';
import { toast } from 'sonner';

interface BookContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  orderId: string;
  bookId: string;
  content: string | null;
  isLoadingContent: boolean;
  contentError: Error | null;
}

export default function BookContentDialog({
  open,
  onOpenChange,
  title,
  orderId,
  bookId,
  content,
  isLoadingContent,
  contentError,
}: BookContentDialogProps) {
  const { data: media, isLoading: isLoadingMedia, error: mediaError } = useGetPurchasedBookMedia(orderId, bookId);
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  const handleDownload = (url: string, filename: string, type: string) => {
    try {
      downloadFromUrl(url, filename);
      toast.success(`${type} download started`);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${type.toLowerCase()}`);
    }
  };

  const toggleImageExpand = (index: number) => {
    setExpandedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isLoading = isLoadingContent || isLoadingMedia;
  const error = contentError || mediaError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Your purchased e-book content and media</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message?.includes('Unauthorized') || error.message?.includes('not included')
                ? 'You do not have permission to access this content'
                : 'Failed to load content. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && media && (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* PDF Section */}
              {media.pdf && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <h3 className="font-semibold">PDF Document</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(media.pdf!.getDirectURL(), `${title}.pdf`, 'PDF')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Images Section */}
              {media.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    <h3 className="font-semibold">Images ({media.images.length})</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {media.images.map((image, index) => {
                      const imageUrl = image.getDirectURL();
                      const isExpanded = expandedImages.has(index);
                      return (
                        <div key={index} className="space-y-2">
                          <div 
                            className={`relative rounded-lg overflow-hidden border bg-muted cursor-pointer transition-all ${
                              isExpanded ? 'col-span-2' : ''
                            }`}
                            onClick={() => toggleImageExpand(index)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className="w-full h-auto object-contain"
                              style={{ maxHeight: isExpanded ? 'none' : '300px' }}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(imageUrl, `${title}_image_${index + 1}.jpg`, 'Image');
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Image {index + 1}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Audio Section */}
              {media.audio.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    <h3 className="font-semibold">Audio Files ({media.audio.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {media.audio.map((audio, index) => {
                      const audioUrl = audio.getDirectURL();
                      return (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Audio {index + 1}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(audioUrl, `${title}_audio_${index + 1}.mp3`, 'Audio')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                          <audio controls className="w-full" src={audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Video Section */}
              {media.video.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    <h3 className="font-semibold">Video Files ({media.video.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {media.video.map((video, index) => {
                      const videoUrl = video.getDirectURL();
                      return (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Video {index + 1}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(videoUrl, `${title}_video_${index + 1}.mp4`, 'Video')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                          <video controls className="w-full rounded" src={videoUrl}>
                            Your browser does not support the video element.
                          </video>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Text Content Section */}
              {content && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Text Content</h3>
                  <div className="rounded-md border p-4 bg-muted/50">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
                    </div>
                  </div>
                </div>
              )}

              {!media.pdf && media.images.length === 0 && media.audio.length === 0 && media.video.length === 0 && !content && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No media or content available for this book.</AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
