import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useRecoverAdminAccess } from '@/hooks/useAdminRecovery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, Loader2, Info } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import LoginButton from '@/components/auth/LoginButton';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export default function AdminRecoveryPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const recoverMutation = useRecoverAdminAccess();
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleRecover = async () => {
    try {
      await recoverMutation.mutateAsync();
      setRecoverySuccess(true);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  if (!identity) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Admin Recovery
              </CardTitle>
              <CardDescription>
                Recover admin access to your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To recover admin access, you must first sign in with your Internet Identity.
              </p>
              <LoginButton />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (recoverySuccess) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200">Recovery Successful</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Admin access has been successfully recovered. You can now access the admin panel.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => navigate({ to: '/admin' })} size="lg">
              Go to Admin Panel
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Admin Recovery
            </CardTitle>
            <CardDescription>
              Recover admin access to your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How Admin Recovery Works</AlertTitle>
              <AlertDescription>
                If you are the designated owner of this store, you can recover admin access. The first user to deploy this canister was automatically assigned as admin.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Current Principal:</p>
              <code className="block p-3 bg-muted rounded-md text-xs break-all">
                {identity.getPrincipal().toString()}
              </code>
            </div>

            {recoverMutation.isError && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Recovery Failed</AlertTitle>
                <AlertDescription>
                  {recoverMutation.error instanceof Error
                    ? recoverMutation.error.message
                    : 'An unexpected error occurred. Please try again or contact support.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleRecover}
              disabled={recoverMutation.isPending}
              size="lg"
              className="w-full"
            >
              {recoverMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Recover Admin Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
