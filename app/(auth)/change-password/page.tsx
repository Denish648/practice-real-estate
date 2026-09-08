"use client";
import { ChangePassowordAPI } from "@/app/api/(auth)/change-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const router = useRouter();
  const [password, setPassword] = useState("");

  function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPassword(value);
  }
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(false);

    const result = changePasswordSchema.safeParse({ password });

    if (!result.success) {
      setFieldError(result.error.issues[0].message);
      setLoading(false);
      return;
    }
    const { password: newPassword } = result.data;

    const { error } = await ChangePassowordAPI(newPassword);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      setFieldError("");
      return;
    }

    toast.success("password successully changed");
    setLoading(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Change Your Password</CardTitle>
              <CardDescription>enter new password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="flex flex-col gap-5"
              >
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    name="password"
                    onChange={(e) => onChangeText(e)}
                    error={fieldError}
                  />
                </Field>
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
  );
}
