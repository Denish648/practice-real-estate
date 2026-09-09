import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/data/user";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CommandIcon,
} from "lucide-react";

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
];

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
];

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, error } = await getUser();
  if (error) throw error;
  if (!user) return <div>user not found</div>;

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
        <NavMain
          items={user.user_metadata.role === "broker" ? brokerData : buyerData}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.user_metadata.name,
            email: user.email ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
