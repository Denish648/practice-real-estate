import Link from "next/link"
import { ArrowUpRight, Building2 } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* same gutters and translucent bar as the public site header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 supports-backdrop-filter:bg-background/60">
            <SidebarTrigger className="-ml-1 rounded-full" />
            <Separator orientation="vertical" className="mx-1 h-4" />

            <Link
              href="/"
              className="flex items-center gap-2 text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
            >
              <Building2 className="size-5" />
              Real Estate
            </Link>

            <div className="ml-auto flex items-center gap-1">
              <Link
                href="/discover"
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                Public board
                <ArrowUpRight className="size-3.5" />
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <div className="mx-auto w-full max-w-300 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
