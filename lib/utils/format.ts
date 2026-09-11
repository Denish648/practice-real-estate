export function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`
}

export function getInitials(name?: string | null): string {
  if (!name?.trim()) return "U"

  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}
