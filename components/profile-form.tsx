"use client"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Profile } from "@/lib/types"
import { updateProfileSchema } from "@/lib/validations/profile"
import { toast } from "sonner"
import { updateProfileAPI } from "@/app/api/profile"
import { validateImage } from "@/lib/validations/image"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { deleteAvatar, uploadAvatar } from "@/lib/data/avatar"
import { getInitials } from "@/lib/utils/format"
import { useRouter } from "next/navigation"

type ProfileFormProps = {
  profile: Pick<Profile, "name" | "company" | "phone" | "avatar_url">
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(profile.avatar_url ?? "")
  const [formData, setFormData] = useState({
    name: profile.name ?? "",
    company: profile.company ?? "",
    phone: profile.phone ?? "",
  })

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name
    const value = e.target.value

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    const result = validateImage(file)

    if (!result.valid) {
      toast.error(result.error)
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const oldAvatarUrl = profile.avatar_url
      let avatarUrl = oldAvatarUrl

      const result = updateProfileSchema.safeParse(formData)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}

        result.error.issues.forEach((issue) => {
          const field = issue.path[0]

          if (typeof field === "string") {
            fieldErrors[field] = issue.message
          }
        })
        setErrors(fieldErrors)
        toast.error("invalid form data")
        return
      }

      //get user
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error("unauthorized")
        return
      }

      // check file and upload it
      if (selectedFile) {
        const { publicUrl, error } = await uploadAvatar(selectedFile, user.id)
        if (error || !publicUrl) {
          toast.error(error?.message ?? "upload error")
          return
        }
        avatarUrl = publicUrl
      }

      const { name, company, phone } = result.data

      const { error } = await updateProfileAPI({
        name,
        company,
        phone,
        avatar_url: avatarUrl,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (selectedFile && oldAvatarUrl) {
        const { error } = await deleteAvatar(oldAvatarUrl)
        if (error?.message) console.warn(error?.message)
      }
      setSelectedFile(null)
      toast.success("Profile Updated successfully")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Profile
          </CardTitle>
          <CardDescription>update your profile information</CardDescription>
        </CardHeader>
        <Card className="max-w-lg">
          <CardContent>
            <FieldGroup>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      placeholder="enter new name"
                      onChange={(e) => onChangeText(e)}
                      error={errors.name}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="company">Company</FieldLabel>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      placeholder="enter new compnay name"
                      onChange={(e) => onChangeText(e)}
                      error={errors.company}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      name="phone"
                      placeholder="1234567890"
                      value={formData.phone}
                      onChange={(e) => onChangeText(e)}
                      error={errors.phone}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="photo">Profile Photo</FieldLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={previewUrl || undefined}
                          alt={formData.name}
                        />
                        <AvatarFallback>
                          {getInitials(formData.name)}
                        </AvatarFallback>
                      </Avatar>

                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </Field>
                </div>
                <Button type="submit" disabled={loading} className="w-max">
                  {loading ? "updating..." : "update"}
                </Button>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
