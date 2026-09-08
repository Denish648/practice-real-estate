"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creatDealAPI } from "@/app/api/deals";
import { toast } from "sonner";
import { CreateDealsInput, createDealsSchema } from "@/lib/validations/deal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreateDeal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<CreateDealsInput>({
    title: "",
    city: "",
    price: 0,
    is_private: false,
  });

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    let value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = createDealsSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const filed = issue.path[0];

        if (typeof filed === "string") {
          fieldErrors[filed] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("invalid form data");
      setLoading(false);
      return;
    }

    const { title, city, price, is_private } = result.data;

    const { error } = await creatDealAPI(title, city, price, is_private);

    if (error) {
      toast.error(error.message);
      setErrors({});
      setLoading(false);
      return;
    }
    toast.success("Deal created successfully");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Create Deal
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col gap-5 max-w-md"
              onSubmit={handleSubmit}
            >
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label>title</Label>
                <Input
                  className="border p-2"
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={onChangeText}
                  error={errors.title}
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <Label>city</Label>
                <Input
                  className="border p-2"
                  type="text"
                  name="city"
                  value={data.city}
                  onChange={onChangeText}
                  error={errors.city}
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <Label>price (₹)</Label>
                <Input
                  className="border p-2"
                  type="number"
                  name="price"
                  value={data.price}
                  onChange={onChangeText}
                  error={errors.price}
                />
              </div>

              {/* Is Private Checkbox */}
              <div className="flex">
                <Input
                  type="checkbox"
                  id="is_private"
                  name="is_private"
                  checked={data.is_private}
                  onChange={onChangeText}
                />
                <Label htmlFor="is_private">
                  Private Deal (only visible to you)
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="border px-5 py-2 w-max bg-black text-white disabled:opacity-50"
              >
                {loading ? "submitting..." : "submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
