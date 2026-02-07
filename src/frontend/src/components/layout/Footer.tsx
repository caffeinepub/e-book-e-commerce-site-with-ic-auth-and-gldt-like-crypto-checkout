import { Heart } from 'lucide-react';
import { SiX } from 'react-icons/si';
import CustomerServiceChatDialog from '../support/CustomerServiceChatDialog';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Contact handles */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://twitter.com/RadicalEconomist101"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <SiX className="h-4 w-4" />
              <span>X (Twitter): @RadicalEconomist101</span>
            </a>
            <span className="text-muted-foreground/50">•</span>
            <a
              href="https://oc.app/community/RadicalEconomist101"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              OpenChat: @RadicalEconomist101
            </a>
            <span className="text-muted-foreground/50">•</span>
            <CustomerServiceChatDialog />
          </div>

          {/* Copyright and attribution */}
          <p className="text-sm text-muted-foreground">
            © 2026. Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
