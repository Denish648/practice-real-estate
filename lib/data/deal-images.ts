import { createClient } from "../supabase/server"

export async function getDealImagesWithSignedUrls(
  dealId: string,
  brokerId: string,
  isPrivate: boolean,
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    //  Security check: If deal is private, only owner can get images
    if (isPrivate && (!user || user.id !== brokerId)) {
      return {
        images: [],
        error: new Error("not allowed to access private deal images"),
      }
    }

    // Generate signed URLs
    const { data: images, error } = await supabase
      .from("deal_images")
      .select("*")
      .eq("deal_id", dealId)
      .order("sort_order", { ascending: true })

    if (error || !images) return { images: [], error }

    const imagesWithUrls = await Promise.all(
      images.map(async (img) => {
        const { data } = await supabase.storage
          .from("deal-images")
          .createSignedUrl(img.path, 3600)

        return {
          ...img,
          signedUrl: data?.signedUrl ?? "",
        }
      }),
    )

    return { images: imagesWithUrls }
  } catch (e) {
    return { images: [] }
  }
}

/**
 * Cover image (lowest sort_order) for many deals in one round trip.
 * Returns a map of deal id to signed URL, skipping deals the viewer cannot read.
 */
export async function getDealCoverImages(dealIds: string[]) {
  try {
    if (dealIds.length === 0) return { covers: {} as Record<string, string> }

    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from("deal_images")
      .select("deal_id, path")
      .in("deal_id", dealIds)
      .order("sort_order", { ascending: true })

    if (error || !images) return { covers: {} as Record<string, string>, error }

    // the query is sorted, so the first row seen for a deal is its cover
    const coverPathByDeal = new Map<string, string>()
    for (const image of images) {
      if (!coverPathByDeal.has(image.deal_id)) {
        coverPathByDeal.set(image.deal_id, image.path)
      }
    }

    const paths = [...coverPathByDeal.values()]
    if (paths.length === 0) return { covers: {} as Record<string, string> }

    const { data: signed } = await supabase.storage
      .from("deal-images")
      .createSignedUrls(paths, 3600)

    const urlByPath = new Map(
      signed?.map((item) => [item.path, item.signedUrl]) ?? [],
    )

    const covers: Record<string, string> = {}
    for (const [dealId, path] of coverPathByDeal) {
      const signedUrl = urlByPath.get(path)
      if (signedUrl) covers[dealId] = signedUrl
    }

    return { covers }
  } catch (e) {
    return {
      covers: {} as Record<string, string>,
      error: e instanceof Error ? e : new Error("something went wrong"),
    }
  }
}
