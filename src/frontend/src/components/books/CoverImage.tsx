import { cn } from '@/lib/utils';
import type { ExternalBlob } from '@/backend';

interface CoverImageProps {
  bookId: string;
  title: string;
  uploadedCover?: ExternalBlob;
  className?: string;
}

export default function CoverImage({ bookId, title, uploadedCover, className }: CoverImageProps) {
  // Use uploaded cover if available via ExternalBlob direct URL, otherwise fall back to generated cover
  const coverSrc = uploadedCover 
    ? uploadedCover.getDirectURL() 
    : '/assets/generated/cover-set-01.dim_600x900.png';

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
      <img
        src={coverSrc}
        alt={`Cover of ${title}`}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = '/assets/generated/cover-set-01.dim_600x900.png';
          e.currentTarget.onerror = () => {
            // Final fallback to SVG if placeholder also fails
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="900"%3E%3Crect fill="%23f5f5f5" width="600" height="900"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="24"%3ENo Cover%3C/text%3E%3C/svg%3E';
          };
        }}
      />
    </div>
  );
}
