export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `order-${timestamp}-${random}`;
}
