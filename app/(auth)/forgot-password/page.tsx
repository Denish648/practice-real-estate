"use client"
import { ForgotPasswordAPI } from "@/app/api/(auth)/forgot-password"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState("")
  const [email, setEmail] = useState("")

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setEmail(value)
  }
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const result = forgotPasswordSchema.safeParse({ email })

    if (!result.success) {
      setFieldError(result.error.issues[0].message)
      setLoading(false)
      return
    }

    const { email: newEmail } = result.data

    const { error } = await ForgotPasswordAPI(newEmail)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      setFieldError("")
      return
    }

    toast.success("Check your mailbox for the password reset link")
    setLoading(false)
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            We will email you a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col gap-5"
          >
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="abc@example.com"
                name="email"
                value={email}
                onChange={(e) => onChangeText(e)}
                error={fieldError}
              />
            </Field>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Sending link..." : "Send reset link"}
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <ArrowLeft />
                Back to login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
