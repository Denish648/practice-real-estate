import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { SignupAPI } from "@/app/api/(auth)/signup"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SignupInput, signupSchema } from "@/lib/validations/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [data, setData] = useState<SignupInput>({
    email: "",
    password: "",
    name: "",
    company: "",
    phone: "",
    role: "broker",
  })
  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = e.target.value
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const result = signupSchema.safeParse(data)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}

      result.error.issues.forEach((issue) => {
        const field = issue.path[0]

        if (typeof field === "string") {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    const { name, email, company, password, phone, role } = result.data

    const { error } = await SignupAPI(
      email,
      password,
      name,
      company,
      role,
      phone,
    )

    if (error) {
      toast.error(error.message)
      setLoading(false)
      setErrors({})
      return
    }

    setLoading(false)
    setErrors({})
    toast.success("account created successfully")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            List your own deals, or browse what brokers have published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FieldGroup>
              {/* name */}
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={data.name}
                  onChange={(e) => onChangeText(e)}
                  error={errors.name}
                />
              </Field>
              {/* email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="abc@example.com"
                  value={data.email}
                  onChange={(e) => onChangeText(e)}
                  error={errors.email}
                />
              </Field>
              {/* password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    className="bg-background pr-9"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => onChangeText(e)}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    error={errors.password}
                  />
                  <Button
                    className="absolute top-0 right-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
              {/* company */}
              <Field>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <Input
                  id="company"
                  type="text"
                  name="company"
                  autoComplete="organization"
                  placeholder="Acme Realty"
                  value={data.company}
                  onChange={(e) => onChangeText(e)}
                  error={errors.company}
                />
              </Field>
              {/* role */}
              <FieldSet>
                <FieldLegend variant="label">I am a</FieldLegend>
                <RadioGroup
                  className="flex flex-row gap-6"
                  value={data.role}
                  onValueChange={(value) => {
                    setData((prev) => ({
                      ...prev,
                      role: value as SignupInput["role"],
                    }))
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="broker" id="broker" />
                    <Label htmlFor="broker">Broker</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer">Buyer</Label>
                  </div>
                </RadioGroup>
              </FieldSet>
              {/* phone */}
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  name="phone"
                  autoComplete="tel"
                  placeholder="1234567890"
                  value={data.phone}
                  onChange={(e) => onChangeText(e)}
                  error={errors.phone}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-foreground underline underline-offset-4"
                  >
                    Log in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
