export function formatTokenAmount(amount: bigint): string {
  return amount.toString();
}

export function parseTokenAmount(amount: string): bigint {
  const parsed = parseInt(amount, 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Invalid token amount');
  }
  return BigInt(parsed);
}

export function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
