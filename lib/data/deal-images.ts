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
