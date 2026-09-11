import Link from "next/link"
import { Building2 } from "lucide-react"
import { Container } from "./container"

// absolute hrefs, because the footer also renders on /discover where these
// sections do not exist
const leftLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Properties", href: "/#properties" },
  { label: "Log in", href: "/login" },
]

const rightLinks = [
  { label: "Discover", href: "/discover" },
  { label: "FAQ", href: "/#faq" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Sign up", href: "/signup" },
]

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-white py-16 md:py-20">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <h2 className="max-w-lg text-3xl leading-[1.15] tracking-tight sm:text-4xl">
            <span className="font-semibold text-neutral-900">
              Find Your Next Property
            </span>{" "}
            <span className="text-neutral-400">with Expert Guidance</span>
          </h2>

          <address className="text-sm leading-relaxed text-neutral-500 not-italic md:text-right">
            150 Feet Ring Rd
            <br />
            Rajkot, Gujarat 360004
            <br />
            (+11839-849-8483)
          </address>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-neutral-200 pt-8 md:flex-row md:justify-between">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
            {leftLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold text-neutral-900"
          >
            <Building2 className="size-5" />
            Real Estate
          </Link>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
            {rightLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Real Estate. All rights reserved.</p>
          <p>Terms &amp; Conditions | Privacy Policy</p>
        </div>
      </Container>
    </footer>
  )
}
