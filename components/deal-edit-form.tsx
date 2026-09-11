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

export default function DealEditForm({ deal }: { deal: Deal }) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
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

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      const { error } = await deleteDealAPI(deal.id)
      if (error) {
        toast.error(error.message)
        setDeleteLoading(false)
        setShowConfirmDelete(false)
        return
      }
      toast.success("deal deleted successfully")
      setShowConfirmDelete(false)
      router.push("/dashboard/broker/my-deals")
      router.refresh()
    } finally {
      setDeleteLoading(false)
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
