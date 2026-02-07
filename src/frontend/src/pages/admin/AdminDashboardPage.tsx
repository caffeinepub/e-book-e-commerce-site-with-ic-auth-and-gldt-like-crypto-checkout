import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminRoute from '@/components/auth/AdminRoute';
import PageLayout from '@/components/layout/PageLayout';
import AdminCatalogPage from './AdminCatalogPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminMintPage from './AdminMintPage';
import AdminSupportInboxPage from './AdminSupportInboxPage';
import AdminSettingsPage from './AdminSettingsPage';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <PageLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your bookstore</p>
          </div>

          <Tabs defaultValue="catalog" className="space-y-6">
            <TabsList>
              <TabsTrigger value="catalog">Catalog</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
              <TabsTrigger value="support">Support Inbox</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog">
              <AdminCatalogPage />
            </TabsContent>

            <TabsContent value="orders">
              <AdminOrdersPage />
            </TabsContent>

            <TabsContent value="mint">
              <AdminMintPage />
            </TabsContent>

            <TabsContent value="support">
              <AdminSupportInboxPage />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettingsPage />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </AdminRoute>
  );
}
