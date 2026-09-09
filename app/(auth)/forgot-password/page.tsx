"use client"
import { ForgotPasswordAPI } from "@/app/api/(auth)/forgot-password"
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
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Forgot Your Password</CardTitle>
              <CardDescription>
                enter email to get reset link to your mail
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
                    placeholder="abc@example.com"
                    name="email"
                    onChange={(e) => onChangeText(e)}
                    error={fieldError}
                  />
                </Field>
                <Button
                  type="submit"
                  className="border w-max px-5 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "sending a link..." : "submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
