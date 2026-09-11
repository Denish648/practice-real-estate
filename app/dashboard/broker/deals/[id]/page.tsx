import DealEditForm from "@/components/deal-edit-form"
import { Button } from "@/components/ui/button"
import { getDealById } from "@/lib/data/deals"
import { getUser } from "@/lib/data/user"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BrokerDealDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { user, error: userError } = await getUser()
  if (userError || !user) throw new Error("unauthorized")

  const { data: deal, error } = await getDealById(id)
  if (error || !deal || deal.broker_id !== user.id) notFound()

  return (
    <div className="flex flex-col gap-8 p-5 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/dashboard/broker/my-deals">
            <ArrowLeft className="size-4" /> Back to My Deals
          </Link>
        </Button>
      </div>

      <DealEditForm deal={deal} />
    </div>
  )
}
