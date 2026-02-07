import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useAuthz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to BookCoin!</DialogTitle>
          <DialogDescription>Please tell us your name to get started.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
          <Button onClick={handleSave} disabled={saveProfile.isPending} className="w-full">
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
