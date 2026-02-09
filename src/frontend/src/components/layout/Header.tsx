import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Library, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCart } from '@/hooks/useCart';
import { useGetBalance } from '@/hooks/useBalance';
import { useIsAdmin } from '@/hooks/useAuthz';
import { formatTokenAmount, shortenPrincipal } from '@/utils/format';

export default function Header() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart = [] } = useGetCart();
  const { data: balance } = useGetBalance();
  const { data: isAdmin } = useIsAdmin();

  const cartItemCount = cart.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/generated/logo-bookcoin.dim_512x512.png" 
              alt="BookCoin Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">Radical Economist Collection</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              Catalog
            </Link>
            {isAuthenticated && (
              <Link
                to="/library"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                activeProps={{ className: 'text-primary' }}
              >
                <Library className="h-4 w-4" />
                My Library
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                activeProps={{ className: 'text-primary' }}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && balance !== undefined && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-mono">
                {formatTokenAmount(balance)} GLDT
              </Badge>
              <span className="text-xs text-muted-foreground hidden lg:inline">
                {shortenPrincipal(identity!.getPrincipal().toString())}
              </span>
            </div>
          )}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
