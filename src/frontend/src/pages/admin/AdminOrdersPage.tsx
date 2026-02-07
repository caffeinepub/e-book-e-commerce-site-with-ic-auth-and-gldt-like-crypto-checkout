import { useGetAllOrders } from '@/hooks/useOrders';
import { useGetBook } from '@/hooks/useBooks';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTokenAmount, shortenPrincipal, formatDate } from '@/utils/format';
import type { Order } from '@/backend';

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useGetAllOrders();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Orders</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-mono text-sm">{order.orderId.slice(0, 12)}...</TableCell>
                <TableCell className="font-mono text-sm">
                  {shortenPrincipal(order.user.toString())}
                </TableCell>
                <TableCell>
                  <OrderItems order={order} />
                </TableCell>
                <TableCell className="font-mono">{formatTokenAmount(order.totalAmount)} GLDT</TableCell>
                <TableCell>{formatDate(order.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function OrderItems({ order }: { order: Order }) {
  return (
    <div className="space-y-1">
      {order.items.map((item) => (
        <OrderItemDetail key={item.bookId} bookId={item.bookId} />
      ))}
    </div>
  );
}

function OrderItemDetail({ bookId }: { bookId: string }) {
  const { data: book } = useGetBook(bookId);
  return <div className="text-sm">{book?.title || bookId}</div>;
}
