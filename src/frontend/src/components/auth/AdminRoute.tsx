import { ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useAuthz';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import PageLayout from '../layout/PageLayout';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsAdmin();
  const navigate = useNavigate();

  // Wait for identity initialization
  if (isInitializing) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!identity) {
    return (
      <PageLayout>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please log in to access the admin panel.</AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  if (adminCheckLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin panel. If you believe this is an error, try admin recovery.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => navigate({ to: '/admin/recover' })} variant="outline">
              Try Admin Recovery
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return <>{children}</>;
}
