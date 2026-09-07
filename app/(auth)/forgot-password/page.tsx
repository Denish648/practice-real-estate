"use client";
import { ForgotPassowordAPI } from "@/app/api/(auth)/forgot-password";
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
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");

  function onChangeText(e: any) {
    const value = e.target.value;
    setEmail(value);
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const { error } = await ForgotPassowordAPI(email);

    if (error) {
      setLoading(false);

      toast.error("Something went wrong");
      return;
    }

    toast.success("Check your mailbox for the password reset link");
    setLoading(false);
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
                    placeholder="m@example.com"
                    name="email"
                    onChange={(e) => onChangeText(e)}
                    required
                  />
                </Field>
                <Button
                  type="submit"
                  className="border w-max px-5"
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
  );
}
