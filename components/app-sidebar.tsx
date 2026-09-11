import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getProfile } from "@/lib/data/profile"
import { getUser } from "@/lib/data/user"
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Briefcase,
  Search,
  UserRound,
} from "lucide-react"
import Link from "next/link"

const brokerData = [
  {
    title: "Dashboard",
    url: "/dashboard/broker",
    icon: <LayoutDashboard />,
  },
  {
    title: "My Deals",
    url: "/dashboard/broker/my-deals",
    icon: <Briefcase />,
  },
  {
    title: "Create Deal",
    url: "/dashboard/broker/create-deal",
    icon: <PlusCircle />,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: <UserRound />,
  },
]

const buyerData = [
  {
    title: "Dashboard",
    url: "/dashboard/buyer",
    icon: <LayoutDashboard />,
  },
  {
    title: "Browse Deals",
    url: "/dashboard/buyer/browse-deals",
    icon: <Search />,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: <UserRound />,
  },
]

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, error } = await getUser()
  if (error) throw error
  if (!user) return <div>user not found</div>

  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")

  const isBroker = profile.role === "broker"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Real Estate</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {profile.role} workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={isBroker ? brokerData : buyerData} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: profile.name,
            email: user.email ?? "",
            avatar: profile.avatar_url ?? "",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
