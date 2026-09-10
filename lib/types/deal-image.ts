import type { Database } from "@/lib/database.types"

export type DealImages = Database["public"]["Tables"]["deal_images"]["Row"]
export type DealImagesInsert =
  Database["public"]["Tables"]["deal_images"]["Insert"]
export type DealImagesUpdate =
  Database["public"]["Tables"]["deal_images"]["Update"]
