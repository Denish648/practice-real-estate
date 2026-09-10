"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDealImage, createDealAPI } from "@/app/api/deals"
import { toast } from "sonner"
import { CreateDealsInput, createDealsSchema } from "@/lib/validations/deal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MAX_DEAL_IMAGES_COUNT,
  validateImage,
  validateImageCount,
} from "@/lib/validations/image"
import { createClient } from "@/lib/supabase/client"
import { deleteDealStorageFiles, uploadDealPhoto } from "@/lib/data/deal-photos"

export default function CreateDeal() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateDealsInput>({
    title: "",
    city: "",
    price: 0,
    is_private: false,
  })

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])

    if (files.length === 0) return

    const combinedFiles = [...selectedFiles, ...files]

    const imgCount = validateImageCount(combinedFiles, MAX_DEAL_IMAGES_COUNT)

    if (!imgCount.valid) {
      toast.error(imgCount.error)
      return
    }

    for (const file of combinedFiles) {
      //max file size 5MB
      const result = validateImage(file, 5)

      if (!result.valid) {
        toast.error(result.error)
        return
      }
    }
    setSelectedFiles(combinedFiles)

    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...urls])
    e.target.value = ""
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const uploadedPaths: string[] = []

    try {
      const result = createDealsSchema.safeParse(formData)

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
        setLoading(false)
        return
      }

      const { title, city, price, is_private } = result.data

      const { data: deal, error: dealError } = await createDealAPI(
        title,
        city,
        price,
        is_private,
      )

      if (dealError || !deal) {
        toast.error(dealError?.message)
        setErrors({})
        setLoading(false)
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
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const { filePath, error } = await uploadDealPhoto(
          file,
          user.id,
          deal.id,
        )
        if (error || !filePath) {
          throw error ?? new Error("Upload Error")
        }

        uploadedPaths.push(filePath)

        const { error: dealImgError } = await addDealImage(deal.id, filePath, i)

        if (dealImgError) {
          throw dealError
        }
      }
      setErrors({})
      setLoading(false)
      toast.success("Deal created successfully")
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } catch (e: any) {
      // cleanup on failure
      if (uploadedPaths.length > 0) {
        await deleteDealStorageFiles(uploadedPaths)
      }
      toast.error(e.message || "Failed to delete deal")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-10 p-5 max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Create Deal
          </CardTitle>
        </CardHeader>
        <Card>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Title */}
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onChangeText}
                  error={errors.title}
                />
              </Field>

              {/* City */}
              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={onChangeText}
                  error={errors.city}
                />
              </Field>

              {/* Price */}
              <Field>
                <FieldLabel htmlFor="price">Price (₹)</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onChangeText}
                  error={errors.price}
                />
              </Field>

              {/* upload image */}
              <Field>
                <FieldLabel htmlFor="photo">Deal Images</FieldLabel>

                <div className="flex flex-col gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                  />

                  {previewUrls.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedFiles.length} / {MAX_DEAL_IMAGES_COUNT} images
                        selected
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {previewUrls.map((url, index) => (
                          <div
                            key={url}
                            className="relative aspect-square overflow-hidden rounded-lg border"
                          >
                            <img
                              src={url}
                              alt={`Deal image ${index + 1}`}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                              <p className="text-xs text-white">{index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              {/* Is Private Checkbox */}
              <Field className="flex-row">
                <input
                  type="checkbox"
                  id="is_private"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={onChangeText}
                  className="cursor-pointer !w-max"
                />
                <Label htmlFor="is_private">
                  Private Deal (only visible to you)
                </Label>
              </Field>

              <Button type="submit" disabled={loading} className="w-max">
                {loading ? "submitting..." : "submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
