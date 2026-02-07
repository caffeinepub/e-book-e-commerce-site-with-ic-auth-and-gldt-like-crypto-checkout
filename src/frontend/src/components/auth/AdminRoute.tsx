import { ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useAuthz';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import PageLayout from '../layout/PageLayout';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsAdmin();

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

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access the admin panel.</AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return <>{children}</>;
}
