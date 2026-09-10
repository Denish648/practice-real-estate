import { createClient } from "../supabase/client"

export async function uploadDealPhoto(
  file: File,
  brokerId: string,
  dealId: string,
) {
  try {
    const supabase = createClient()

    const extension = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${extension}`
    const filePath = `${brokerId}/${dealId}/${fileName}`

    const { error } = await supabase.storage
      .from("deal-images")
      .upload(filePath, file)

    return { filePath, error }
  } catch (e) {
    if (e instanceof Error) {
      return { filePath: null, error: e }
    }
    return { filePath: null, error: new Error("somethin went wrong") }
  }
}

export async function deleteDealStorageFiles(paths: string[]) {
  try {
    if (!paths || paths.length === 0) return { error: null }
    const supabase = createClient()
    const { error } = await supabase.storage.from("deal-images").remove(paths)
    return { error }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e }
    }
    return { error: new Error("something went wrong") }
  }
}
