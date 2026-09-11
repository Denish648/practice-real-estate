import type { Database } from "@/lib/database.types"

export type Deal = Database["public"]["Tables"]["deals"]["Row"]
export type DealInsert = Database["public"]["Tables"]["deals"]["Insert"]
export type DealUpdate = Database["public"]["Tables"]["deals"]["Update"]

/** A public deal joined with the broker card shown on `/discover`. */
export type PublicDeal = Deal & {
  broker: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "id" | "name" | "company" | "avatar_url"
  > | null
}
