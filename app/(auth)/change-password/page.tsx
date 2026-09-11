"use client"
import { ChangePasswordAPI } from "@/app/api/(auth)/change-password"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePasswordSchema } from "@/lib/validations/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ChangePassword() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState("")
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setNewPassword(value)
  }
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const result = changePasswordSchema.safeParse({ password: newPassword })

    if (!result.success) {
      setFieldError(result.error.issues[0].message)
      setLoading(false)
      return
    }
    const { password } = result.data

    const { error } = await ChangePasswordAPI(password)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      setFieldError("")
      return
    }

    toast.success("password successully changed")
    setLoading(false)
    router.push("/login")
    router.refresh()
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Change your password</CardTitle>
          <CardDescription>
            You will be signed out and asked to log in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col gap-5"
          >
            <Field>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <div className="relative">
                <Input
                  className="bg-background pr-9"
                  id="new-password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => onChangeText(e)}
                  type={showPassword ? "text" : "password"}
                  error={fieldError}
                />
                <Button
                  className="absolute top-0 right-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FieldDescription>
                At least 6 characters, with a number and a special character.
              </FieldDescription>
            </Field>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
