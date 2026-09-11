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
} from "@/components/ui/sidebar"
import { getProfile } from "@/lib/data/profile"
import { getUser } from "@/lib/data/user"
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CommandIcon,
} from "lucide-react"

const brokerData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    title: "My Deals",
    url: "/dashboard/broker/my-deals",
    icon: <Building2 />,
  },
  {
    title: "Create Deal",
    url: "/dashboard/broker/create-deal",
    icon: <PlusCircle />,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: <PlusCircle />,
  },
]

const buyerData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    title: "Browse Deals",
    url: "/dashboard/buyer/browse-deals",
    icon: <Building2 />,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: <PlusCircle />,
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Real estate</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={profile.role === "broker" ? brokerData : buyerData} />
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
    </Sidebar>
  )
}
