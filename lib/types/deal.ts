import type { Database } from "@/lib/database.types"

export type Deal = Database["public"]["Tables"]["deals"]["Row"]
export type DealInsert = Database["public"]["Tables"]["deals"]["Insert"]
export type DealUpdate = Database["public"]["Tables"]["deals"]["Update"]
