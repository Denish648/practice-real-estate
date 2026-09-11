import Link from "next/link"
import { ArrowUpRight, Building2, Eye, Lock, Phone } from "lucide-react"
import ProfileForm from "@/components/profile-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getProfile } from "@/lib/data/profile"
import { getInitials } from "@/lib/utils/format"

export default async function Profile() {
  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")

  const isBroker = profile.role === "broker"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          {isBroker
            ? "These details travel with every listing you publish."
            : "Your account details. Buyer profiles are visible only to you."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <ProfileForm profile={profile} />

        <aside className="flex flex-col gap-6">
          {/* the same card buyers meet on a deal page */}
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {isBroker ? "How buyers see you" : "Your account"}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.name}
                />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{profile.name}</p>
                <p className="inline-flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  {profile.company || "Independent"}
                </p>
              </div>

              <Badge variant="outline" className="shrink-0 capitalize">
                {profile.role}
              </Badge>
            </div>

            <p className="mt-4 inline-flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              {profile.phone || (
                <span className="text-muted-foreground">
                  No phone number yet
                </span>
              )}
            </p>
          </section>

          {/* what the role actually means, from the access rules */}
          <section className="rounded-2xl bg-secondary p-5">
            <p className="flex gap-2.5 text-sm">
              {isBroker ? (
                <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <span>
                <span className="block font-medium">
                  {isBroker ? "Public contact card" : "Private to you"}
                </span>
                <span className="text-muted-foreground">
                  {isBroker
                    ? "Anyone viewing one of your public listings can see this name, company and phone number."
                    : "Nobody else can read your profile — brokers only publish their own details."}
                </span>
              </span>
            </p>

            {isBroker && (
              <Link
                href="/dashboard/broker/my-deals"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                Review your listings
                <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
