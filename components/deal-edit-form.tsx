"use client"
import { Deal } from "@/lib/types"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Field, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import ConfirmDialog from "./confirm-dialog"
import { deleteDealAPI, updateDealAPI } from "@/app/api/deals"
import { toast } from "sonner"
import { updateDealsSchema } from "@/lib/validations/deal"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { deleteDealStorageFiles } from "@/lib/data/deal-photos"
import { DealImages } from "@/lib/types/deal-image"

type DealWithImages = Deal & {
  images: {
    id: string
    path: string
    sort_order: number
  }[]
}
interface DealEditFormProps {
  deal: DealWithImages
}

export default function DealEditForm({ deal }: DealEditFormProps) {
  console.log(JSON.stringify(deal.images))

  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [images, setImages] = useState<DealImages[]>([])
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [formData, setFormData] = useState({
    title: deal.title,
    city: deal.city,
    price: deal.price,
    is_private: deal.is_private,
  })

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0]

  //   if (!file) return

  //   const result = validateImage(file)

  //   if (!result.valid) {
  //     toast.error(result.error)
  //     return
  //   }
  //   setSelectedFile(file)
  //   setPreviewUrl(URL.createObjectURL(file))
  // }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      // get storage paths of deals image
      const supabase = createClient()
      const { data: dealImagesPaths } = await supabase
        .from("deal_images")
        .select("path")
        .eq("deal_id", deal.id)

      // Delete files from Storage
      const paths = dealImagesPaths?.map((img) => img.path) ?? []
      if (paths.length > 0) {
        const { error: storageError } = await deleteDealStorageFiles(paths)

        if (storageError) {
          throw storageError
        }
      }

      const { error: deleteDealError } = await deleteDealAPI(deal.id)
      if (deleteDealError) throw deleteDealError

      if (dealImagesPaths && dealImagesPaths.length > 0) {
        const paths = dealImagesPaths.map((img) => img.path)
        await deleteDealStorageFiles(paths)
      }

      toast.success("deal deleted successfully")
      setShowConfirmDelete(false)
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = updateDealsSchema.safeParse(formData)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}

        result.error.issues.forEach((issue) => {
          const field = issue.path[0]
          if (typeof field === "string") {
            fieldErrors[field] = issue.message
          }
        })
        setErrors(fieldErrors)
        return
      }

      const { error: dealError } = await updateDealAPI(deal.id, result.data)

      if (dealError) {
        toast.error(dealError.message)
        return
      }

      toast.success("deal updated successfully")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Deal</CardTitle>
          <CardDescription>Update details or delete this deal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
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
            {/* <Field>
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
            </Field> */}

            {/* Is Private */}
            <Field className="flex-row items-center gap-2">
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

            <div className="flex items-center justify-between pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Deal"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
              >
                Delete Deal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={showConfirmDelete}
        title="Delete Deal"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  )
}
