"use client"
import { Deal, DealImageWithUrl } from "@/lib/types"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Field, FieldDescription, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import ConfirmDialog from "./confirm-dialog"
import {
  addDealImage,
  deleteDealAPI,
  deleteDealImageAPI,
  updateDealAPI,
} from "@/app/api/deals"
import { toast } from "sonner"
import { updateDealsSchema } from "@/lib/validations/deal"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { deleteDealStorageFiles, uploadDealPhoto } from "@/lib/data/deal-photos"
import { MAX_DEAL_IMAGES_COUNT, validateImage } from "@/lib/validations/image"
import { Loader2, Trash2, X } from "lucide-react"
import { formatINRPrice } from "@/lib/utils/format"

type DealEditFormProps = {
  deal: Deal
  initialImages?: DealImageWithUrl[]
}

export default function DealEditForm({
  deal,
  initialImages = [],
}: DealEditFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [existingImages, setExistingImages] =
    useState<DealImageWithUrl[]>(initialImages)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: deal.title,
    city: deal.city,
    price: deal.price,
    is_private: deal.is_private,
  })

  const imageCount = existingImages.length + selectedFiles.length

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])

    if (files.length === 0) return

    const totalCount =
      existingImages.length + selectedFiles.length + files.length

    if (totalCount > MAX_DEAL_IMAGES_COUNT) {
      toast.error(`Maximum ${MAX_DEAL_IMAGES_COUNT} images are allowed`)
      return
    }

    for (const file of files) {
      // max file size 5MB
      const result = validateImage(file, 5)

      if (!result.valid) {
        toast.error(result.error)
        return
      }
    }

    setSelectedFiles((prev) => [...prev, ...files])

    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...urls])
    e.target.value = ""
  }

  function handleRemoveNewPhoto(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleDeleteExistingImage(image: DealImageWithUrl) {
    setDeletingImageId(image.id)
    try {
      // 1. Delete file from Storage
      const { error: storageError } = await deleteDealStorageFiles([image.path])
      if (storageError) {
        throw storageError
      }

      // 2. Delete row from deal_images table
      const { error: dbError } = await deleteDealImageAPI(image.id)
      if (dbError) {
        throw dbError
      }

      setExistingImages((prev) => prev.filter((img) => img.id !== image.id))
      toast.success("Image deleted successfully")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete image"
      toast.error(message)
    } finally {
      setDeletingImageId(null)
    }
  }

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

      toast.success("deal deleted successfully")
      setShowConfirmDelete(false)
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete deal"
      toast.error(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setLoading(true)

    const uploadedPaths: string[] = []

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

      // Upload newly selected images if any
      if (selectedFiles.length > 0) {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          toast.error("unauthorized")
          return
        }

        const currentCount = existingImages.length

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const { filePath, error: uploadError } = await uploadDealPhoto(
            file,
            user.id,
            deal.id,
          )

          if (uploadError || !filePath) {
            throw uploadError ?? new Error("Upload Error")
          }

          uploadedPaths.push(filePath)

          const sortOrder = currentCount + i
          const { error: dealImgError } = await addDealImage(
            deal.id,
            filePath,
            sortOrder,
          )

          if (dealImgError) {
            throw dealImgError
          }
        }

        // Clean up preview URLs
        previewUrls.forEach((url) => URL.revokeObjectURL(url))
        setSelectedFiles([])
        setPreviewUrls([])
      }

      setErrors({})
      toast.success("deal updated successfully")
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } catch (e) {
      // cleanup on failure
      if (uploadedPaths.length > 0) {
        await deleteDealStorageFiles(uploadedPaths)
      }
      const message = e instanceof Error ? e.message : "Failed to update deal"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Deal details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              The information buyers see on this listing.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
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

            <Field>
              <FieldLabel htmlFor="price">Price (₹)</FieldLabel>
              <Input
                id="price"
                type="number"
                name="price"
                min={0}
                value={formData.price}
                onChange={onChangeText}
                error={errors.price}
              />
              <FieldDescription>
                {formData.price > 0
                  ? `Shown to buyers as ${formatINRPrice(formData.price)}.`
                  : "Enter the amount in rupees — 12500000 shows as ₹1.25 Cr."}
              </FieldDescription>
            </Field>

            <Field orientation="horizontal">
              <input
                type="checkbox"
                id="is_private"
                name="is_private"
                checked={formData.is_private}
                onChange={onChangeText}
                className="size-4 shrink-0 cursor-pointer accent-primary"
              />
              <Label htmlFor="is_private" className="cursor-pointer">
                Private deal, only visible to you
              </Label>
            </Field>
          </CardContent>
        </Card>

        {/* Deal photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              {imageCount} of {MAX_DEAL_IMAGES_COUNT} images used.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="photo">Add images</FieldLabel>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                multiple
                disabled={imageCount >= MAX_DEAL_IMAGES_COUNT}
                onChange={handlePhotoChange}
              />
              <FieldDescription>
                Up to 5MB each. New images are uploaded when you save.
              </FieldDescription>
            </Field>

            {imageCount > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <img
                      src={img.signedUrl}
                      alt={`Deal image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute bottom-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-xs font-medium">
                      #{index + 1}
                    </span>

                    <button
                      type="button"
                      disabled={deletingImageId === img.id}
                      onClick={() => handleDeleteExistingImage(img)}
                      className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                      aria-label={`Delete image ${index + 1}`}
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-primary"
                  >
                    <img
                      src={url}
                      alt={`New image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute bottom-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-xs font-medium text-primary">
                      New
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove new image ${index + 1}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Saving..." : "Save changes"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowConfirmDelete(true)}
          >
            <Trash2 />
            Delete deal
          </Button>
        </div>
      </form>

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
