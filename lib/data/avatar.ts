import { createClient } from "../supabase/client"

export async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()

  const extension = file.name.split(".").pop()

  const fileName = `${crypto.randomUUID()}.${extension}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file)

  if (uploadError) {
    return {
      filePath: null,
      publicUrl: null,
      error: uploadError,
    }
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

  return {
    filePath,
    publicUrl: data.publicUrl,
    error: null,
  }
}

export async function deleteAvatar(avatarUrl: string) {
  const supabase = createClient()

  const folderName = "/avatars/"

  const indexOfFolder = avatarUrl.indexOf(folderName)

  if (indexOfFolder === -1) {
    return {
      error: new Error("Invalid Avatar URL"),
    }
  }

  const filePath = avatarUrl.substring(indexOfFolder + folderName.length)

  const { error } = await supabase.storage.from("avatars").remove([filePath])

  return { error }
}
