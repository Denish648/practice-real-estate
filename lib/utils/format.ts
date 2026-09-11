const LAKH = 100_000
const CRORE = 10_000_000

/** Whole rupees, grouped the Indian way — used below ₹1 Lakh. */
const rupees = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 })

/** Lakh/Crore figure: at most two decimals, never zero-padded. */
const unitAmount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 })

/** Rounds in the display unit so no float artifact survives into the string. */
function round2(value: number) {
  return Math.round(value * 100) / 100
}

/**
 * The single price formatter for the product.
 *
 * Prices stay numeric in Postgres (`12500000`); this is presentation only
 * (`₹1.25 Cr`). Lakh below a crore, Cr at or above it, trailing zeros dropped.
 * `compact` shortens the unit for tight columns: `₹1.25Cr`, `₹25.5L`.
 *
 * Below ₹1 Lakh the Lakh unit stops being readable — `₹0.5 Lakh` is not how
 * anyone quotes ₹50,000 — so small amounts fall back to grouped rupees.
 */
export function formatINRPrice(
  value: number | string | null | undefined,
  options: { compact?: boolean } = {},
) {
  const { compact = false } = options
  const amount = typeof value === "string" ? Number(value) : value

  if (amount === null || amount === undefined) return "—"
  if (!Number.isFinite(amount) || amount < 0) return "—"
  if (amount === 0) return "₹0"
  if (amount < LAKH) return `₹${rupees.format(amount)}`

  // round first, then pick the unit: ₹99,99,999 reads as ₹1 Cr, not ₹100 Lakh
  const inLakh = round2(amount / LAKH)

  if (amount >= CRORE || inLakh >= 100) {
    return `₹${unitAmount.format(round2(amount / CRORE))}${compact ? "Cr" : " Cr"}`
  }

  return `₹${unitAmount.format(inLakh)}${compact ? "L" : " Lakh"}`
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
