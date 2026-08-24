export function formatMinorAmount(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amountMinor / 100)
}
