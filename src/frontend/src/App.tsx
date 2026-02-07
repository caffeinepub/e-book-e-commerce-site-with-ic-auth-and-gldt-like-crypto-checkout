import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyLibraryPage from './pages/MyLibraryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const bookDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId',
  component: BookDetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order/$orderId',
  component: OrderConfirmationPage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: MyLibraryPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  bookDetailsRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  libraryRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
