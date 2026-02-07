import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export default function PageLayout({ children, className, maxWidth = '2xl' }: PageLayoutProps) {
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className={cn('container mx-auto px-4 py-8', maxWidthClass, className)}>
      {children}
    </div>
  );
}
