"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDealImage, createDealAPI } from "@/app/api/deals"
import { toast } from "sonner"
import { CreateDealsInput, createDealsSchema } from "@/lib/validations/deal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MAX_DEAL_IMAGES_COUNT,
  validateImage,
  validateImageCount,
} from "@/lib/validations/image"
import { createClient } from "@/lib/supabase/client"
import { deleteDealStorageFiles, uploadDealPhoto } from "@/lib/data/deal-photos"
import { ArrowLeft, Eye, ImagePlus, Loader2, Lock, X } from "lucide-react"
import { formatINRPrice } from "@/lib/utils/format"
import Link from "next/link"

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
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  function handleRemovePhoto(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
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
          throw dealImgError
        }
      }
      setErrors({})
      toast.success("Deal created successfully")
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } catch (e) {
      // cleanup on failure
      if (uploadedPaths.length > 0) {
        await deleteDealStorageFiles(uploadedPaths)
      }
      const message = e instanceof Error ? e.message : "Failed to create deal"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/broker/my-deals"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to My Deals
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Create Deal
        </h1>
        <p className="text-sm text-muted-foreground">
          Two steps: the details buyers read, then the photos they judge it by.
        </p>
      </div>

      {/* what publishing actually does, so nothing is a surprise */}
      <div className="grid gap-3 rounded-2xl bg-secondary p-5 sm:grid-cols-3">
        <p className="flex gap-2.5 text-sm">
          <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-medium">Public by default</span>
            <span className="text-muted-foreground">
              It appears on the board and the public listing page.
            </span>
          </span>
        </p>

        <p className="flex gap-2.5 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-medium">Private stays yours</span>
            <span className="text-muted-foreground">
              Hidden from buyers by the database, not just the UI.
            </span>
          </span>
        </p>

        <p className="flex gap-2.5 text-sm">
          <ImagePlus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-medium">
              Up to {MAX_DEAL_IMAGES_COUNT} photos
            </span>
            <span className="text-muted-foreground">
              Uploaded when you submit. You can add more later.
            </span>
          </span>
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Deal details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              The information buyers see on this listing.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                type="text"
                name="title"
                placeholder="3 BHK apartment near the lake"
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
                placeholder="Ahmedabad"
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
                min={0}
                placeholder="5000000"
                // keeps the field empty instead of showing a pre-filled 0
                value={formData.price || ""}
                onChange={onChangeText}
                error={errors.price}
              />
              <FieldDescription>
                {formData.price > 0
                  ? `Shown to buyers as ${formatINRPrice(formData.price)}.`
                  : "Enter the amount in rupees — 12500000 shows as ₹1.25 Cr."}
              </FieldDescription>
            </Field>

            {/* Is Private Checkbox */}
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
              {selectedFiles.length} of {MAX_DEAL_IMAGES_COUNT} images selected.
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
                disabled={selectedFiles.length >= MAX_DEAL_IMAGES_COUNT}
                onChange={handlePhotoChange}
              />
              <FieldDescription>
                Up to 5MB each. Images are uploaded when you create the deal.
              </FieldDescription>
            </Field>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

                    <span className="absolute bottom-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-xs font-medium">
                      #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Creating..." : "Create deal"}
          </Button>

          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/broker/my-deals">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
