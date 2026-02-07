import { useState } from 'react';
import { useResetStore } from '@/hooks/useResetStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const resetMutation = useResetStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      setResetSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Store Reset
          </CardTitle>
          <CardDescription>
            Reset your store to a clean state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning: Irreversible Action</AlertTitle>
              <AlertDescription>
                Resetting the store will permanently delete all books, orders, cart items, customer messages, and token balances.
                This action cannot be undone.
              </AlertDescription>
            </Alert>

            {resetSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Reset Complete</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your store has been successfully reset to a clean state.
                </AlertDescription>
              </Alert>
            )}

            {resetMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Reset Failed</AlertTitle>
                <AlertDescription>
                  {resetMutation.error instanceof Error
                    ? resetMutation.error.message
                    : 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? 'Resetting...' : 'Reset / Relaunch Store'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This will permanently delete all data from your store, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All books in the catalog</li>
                      <li>All customer orders</li>
                      <li>All shopping carts</li>
                      <li>All customer support messages</li>
                      <li>All token balances</li>
                    </ul>
                    <p className="font-semibold pt-2">
                      This action cannot be undone. Your store will be reset to a completely clean state.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Reset Store
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
