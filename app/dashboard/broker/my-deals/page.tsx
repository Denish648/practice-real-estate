import { getDeals } from "@/lib/data/deals";
import { getUser } from "@/lib/data/user";
import { MyDealsTable } from "@/components/my-deals-table";

export default async function MyDeals() {
  const { user, error: userError } = await getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Unauthorized");

  const { data: deals, error: dealsError } = await getDeals(user.id);
  if (dealsError) throw dealsError;

  return (
    <div className="flex flex-col gap-10 p-5">
      <h1 className="text-3xl font-semibold tracking-tight">My Deals</h1>
      <MyDealsTable deals={deals ?? []} />
    </div>
  );
}
