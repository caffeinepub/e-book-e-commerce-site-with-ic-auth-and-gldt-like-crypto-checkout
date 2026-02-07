import { useState } from 'react';
import { useMintTokens } from '@/hooks/useBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { parseTokenAmount } from '@/utils/format';
import { parsePrincipal } from '@/utils/principal';
import { toast } from 'sonner';

export default function AdminMintPage() {
  const mintTokens = useMintTokens();
  const [formData, setFormData] = useState({
    principal: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const principal = parsePrincipal(formData.principal);
      const amount = parseTokenAmount(formData.amount);

      await mintTokens.mutateAsync({ to: principal, amount });
      toast.success('Tokens minted successfully');
      setFormData({ principal: '', amount: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint tokens');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mint Tokens</h2>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Mint GLDT Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Recipient Principal</Label>
              <Input
                id="principal"
                placeholder="Enter principal ID"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (GLDT)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={mintTokens.isPending} className="w-full">
              {mintTokens.isPending ? 'Minting...' : 'Mint Tokens'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
