import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SignupAPI } from "@/app/api/(auth)/signup";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    phone: "",
    role: "",
  });
  const onChangeText = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { userData, error } = await SignupAPI(
      data.email,
      data.password,
      data.name,
      data.company,
      data.role,
      data.phone,
    );

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const role = userData?.user?.user_metadata?.role;

    if (role) {
      setLoading(false);
      router.push(`/dashboard/${role}`);
      router.refresh();
    } else {
      setLoading(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
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
                  placeholder="John Doe"
                  value={data.name}
                  onChange={(e) => onChangeText(e)}
                  required
                />
              </Field>
              {/* email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  value={data.email}
                  onChange={(e) => onChangeText(e)}
                  required
                />
              </Field>
              {/* password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  onChange={(e) => onChangeText(e)}
                  required
                />
              </Field>
              {/* company */}
              <Field>
                <FieldLabel htmlFor="email">Company</FieldLabel>
                <Input
                  id="company"
                  type="text"
                  name="company"
                  placeholder="company name"
                  value={data.company}
                  onChange={(e) => onChangeText(e)}
                  required
                />
              </Field>
              {/* role */}
              <RadioGroup
                defaultValue="broker"
                value={data.role}
                onValueChange={(value) => {
                  setData((prev) => ({
                    ...prev,
                    role: value,
                  }));
                }}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    value="broker"
                    id="broker"
                    checked={data.role === "broker"}
                    onChange={(e) => onChangeText(e)}
                  />
                  <Label htmlFor="broker">Broker</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    value="buyer"
                    id="buyer"
                    checked={data.role === "buyer"}
                    onChange={(e) => onChangeText(e)}
                  />
                  <Label htmlFor="buyer">Buyer</Label>
                </div>
              </RadioGroup>
              {/* phone */}
              <Field>
                <FieldLabel htmlFor="email">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="number"
                  name="phone"
                  placeholder="1234567890"
                  value={data.phone}
                  onChange={(e) => onChangeText(e)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "creating acoount..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
