import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, Music, Video, FileText } from 'lucide-react';
import { useUploadBookPdf, useRemoveBookPdf, useUploadBookImage, useRemoveBookImage, useUploadBookAudio, useRemoveBookAudio, useUploadBookVideo, useRemoveBookVideo } from '@/hooks/useBooks';
import { toast } from 'sonner';
import type { Book } from '@/backend';

interface BookMediaManagerProps {
  book: Book;
}

export default function BookMediaManager({ book }: BookMediaManagerProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const uploadPdf = useUploadBookPdf();
  const removePdf = useRemoveBookPdf();
  const uploadImage = useUploadBookImage();
  const removeImage = useRemoveBookImage();
  const uploadAudio = useUploadBookAudio();
  const removeAudio = useRemoveBookAudio();
  const uploadVideo = useUploadBookVideo();
  const removeVideo = useRemoveBookVideo();

  const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2);
        return file.type.startsWith(prefix);
      }
      return file.type === type;
    });
  };

  const handleFileUpload = async (
    file: File,
    type: 'pdf' | 'image' | 'audio' | 'video',
    allowedTypes: string[]
  ) => {
    if (!validateFileType(file, allowedTypes)) {
      toast.error(`Invalid file type. Please upload a valid ${type} file.`);
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const progressKey = `${type}-${Date.now()}`;

      const onProgress = (percentage: number) => {
        setUploadProgress(prev => ({ ...prev, [progressKey]: percentage }));
      };

      switch (type) {
        case 'pdf':
          await uploadPdf.mutateAsync({ bookId: book.id, pdfBytes: bytes, onProgress });
          toast.success('PDF uploaded successfully');
          break;
        case 'image':
          await uploadImage.mutateAsync({ bookId: book.id, imageBytes: bytes, onProgress });
          toast.success('Image uploaded successfully');
          break;
        case 'audio':
          await uploadAudio.mutateAsync({ bookId: book.id, audioBytes: bytes, onProgress });
          toast.success('Audio uploaded successfully');
          break;
        case 'video':
          await uploadVideo.mutateAsync({ bookId: book.id, videoBytes: bytes, onProgress });
          toast.success('Video uploaded successfully');
          break;
      }

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[progressKey];
        return newProgress;
      });
    } catch (error: any) {
      toast.error(error.message || `Failed to upload ${type}`);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        const progressKey = Object.keys(prev).find(k => k.startsWith(type));
        if (progressKey) delete newProgress[progressKey];
        return newProgress;
      });
    }
  };

  const handleRemove = async (type: 'pdf' | 'image' | 'audio' | 'video', index?: number) => {
    try {
      switch (type) {
        case 'pdf':
          await removePdf.mutateAsync(book.id);
          toast.success('PDF removed successfully');
          break;
        case 'image':
          if (index !== undefined) {
            await removeImage.mutateAsync({ bookId: book.id, imageIndex: index });
            toast.success('Image removed successfully');
          }
          break;
        case 'audio':
          if (index !== undefined) {
            await removeAudio.mutateAsync({ bookId: book.id, audioIndex: index });
            toast.success('Audio removed successfully');
          }
          break;
        case 'video':
          if (index !== undefined) {
            await removeVideo.mutateAsync({ bookId: book.id, videoIndex: index });
            toast.success('Video removed successfully');
          }
          break;
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to remove ${type}`);
    }
  };

  const pdfProgress = Object.entries(uploadProgress).find(([key]) => key.startsWith('pdf'))?.[1];
  const imageProgress = Object.entries(uploadProgress).find(([key]) => key.startsWith('image'))?.[1];
  const audioProgress = Object.entries(uploadProgress).find(([key]) => key.startsWith('audio'))?.[1];
  const videoProgress = Object.entries(uploadProgress).find(([key]) => key.startsWith('video'))?.[1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Media Attachments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PDF Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">PDF</span>
              <Badge variant={book.media.pdf ? 'default' : 'outline'}>
                {book.media.pdf ? 'Uploaded' : 'None'}
              </Badge>
            </div>
            <div className="flex gap-2">
              {book.media.pdf && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove('pdf')}
                  disabled={removePdf.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={uploadPdf.isPending}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/pdf';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload(file, 'pdf', ['application/pdf']);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          {pdfProgress !== undefined && (
            <Progress value={pdfProgress} className="h-2" />
          )}
        </div>

        {/* Images Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="font-medium">Images</span>
              <Badge variant={book.media.images.length > 0 ? 'default' : 'outline'}>
                {book.media.images.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={uploadImage.isPending}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file, 'image', ['image/*']);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          {imageProgress !== undefined && (
            <Progress value={imageProgress} className="h-2" />
          )}
          {book.media.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {book.media.images.map((_, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  Image {index + 1}
                  <button
                    onClick={() => handleRemove('image', index)}
                    disabled={removeImage.isPending}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Audio Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="font-medium">Audio</span>
              <Badge variant={book.media.audio.length > 0 ? 'default' : 'outline'}>
                {book.media.audio.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={uploadAudio.isPending}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file, 'audio', ['audio/*']);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          {audioProgress !== undefined && (
            <Progress value={audioProgress} className="h-2" />
          )}
          {book.media.audio.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {book.media.audio.map((_, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  Audio {index + 1}
                  <button
                    onClick={() => handleRemove('audio', index)}
                    disabled={removeAudio.isPending}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Video Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="font-medium">Video</span>
              <Badge variant={book.media.video.length > 0 ? 'default' : 'outline'}>
                {book.media.video.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={uploadVideo.isPending}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file, 'video', ['video/*']);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          {videoProgress !== undefined && (
            <Progress value={videoProgress} className="h-2" />
          )}
          {book.media.video.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {book.media.video.map((_, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  Video {index + 1}
                  <button
                    onClick={() => handleRemove('video', index)}
                    disabled={removeVideo.isPending}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
