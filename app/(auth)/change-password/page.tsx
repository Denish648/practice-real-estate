"use client"
import { ChangePasswordAPI } from "@/app/api/(auth)/change-password"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePasswordSchema } from "@/lib/validations/auth"
import { Eye, EyeOff } from "lucide-react"
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
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Change Your Password</CardTitle>
              <CardDescription>Enter New Password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="flex flex-col gap-5"
              >
                <div className="w-full max-w-sm space-y-2">
                  <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      className="bg-background"
                      id="password-toggle"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => onChangeText(e)}
                      type={showPassword ? "text" : "password"}
                      error={fieldError}
                    />
                    <Button
                      className="absolute top-0 right-0 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="border w-max px-5"
                  disabled={loading}
                >
                  {loading ? "changing password..." : "confirm"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
