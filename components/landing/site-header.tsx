"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "cn"
import { Building2, Menu, X } from "lucide-react"
import { Container } from "./container"

interface NavItem {
  id: string
  label: string
  href: string
  /** anchors scroll within the landing page, routes navigate */
  type: "anchor" | "route"
}

const navLinks: NavItem[] = [
  { id: "home", label: "Home", href: "#home", type: "anchor" },
  { id: "about", label: "About Us", href: "#about", type: "anchor" },
  {
    id: "properties",
    label: "Property List",
    href: "#properties",
    type: "anchor",
  },
  { id: "discover", label: "Discover", href: "/discover", type: "route" },
  { id: "contact", label: "Contact Us", href: "#contact", type: "anchor" },
]

/**
 * `variant="landing"` runs the scrollspy against the sections on `/`.
 * `variant="page"` is for the other public pages (`/discover`): the anchors turn
 * into links back to the landing sections and `activeNav` picks the pill.
 */
export function SiteHeader({
  isSignedIn,
  variant = "landing",
  activeNav,
}: {
  isSignedIn: boolean
  variant?: "landing" | "page"
  activeNav?: string
}) {
  const isLanding = variant === "landing"
  const [activeId, setActiveId] = useState(
    isLanding ? "home" : (activeNav ?? "discover"),
  )
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  })

  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const isClickingRef = useRef(false)

  // Update active pill indicator position on activeId change or resize
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemRefs.current[activeId]
      if (activeEl) {
        setIndicator({
          left: activeEl.offsetLeft,
          top: activeEl.offsetTop,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
          opacity: 1,
        })
      }
    }

    const timer = setTimeout(updateIndicator, 0)
    window.addEventListener("resize", updateIndicator)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updateIndicator)
    }
  }, [activeId])

  // Scroll and hash listener for sticky header and scrollspy
  useEffect(() => {
    const handleHash = () => {
      const hashId = window.location.hash.replace("#", "")
      if (navLinks.some((l) => l.id === hashId)) {
        setActiveId(hashId)
      }
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)

      // off the landing page there are no sections to spy on
      if (!isLanding || isClickingRef.current) return

      // Near top of page: Home
      if (scrollY < 120) {
        setActiveId("home")
        return
      }

      // Near bottom of page: Contact Us
      const isBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 100
      if (isBottom) {
        setActiveId("contact")
        return
      }

      // Check sections from bottom to top
      const sectionIds = ["contact", "properties", "about"]
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 240 && rect.bottom >= 100) {
            setActiveId(id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    if (isLanding) window.addEventListener("hashchange", handleHash)
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("hashchange", handleHash)
    }
  }, [isLanding])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavItem,
  ) => {
    e.preventDefault()
    setActiveId(link.id)
    isClickingRef.current = true

    if (link.id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      window.history.replaceState(null, "", window.location.pathname)
    } else {
      const target = document.getElementById(link.id)
      if (target) {
        target.scrollIntoView({ behavior: "smooth" })
        window.history.replaceState(null, "", `#${link.id}`)
      }
    }

    setTimeout(() => {
      isClickingRef.current = false
    }, 850)
  }

  /** On the landing page anchors scroll, everywhere else they navigate to `/`. */
  const hrefFor = (link: NavItem) =>
    link.type === "route" || isLanding ? link.href : `/${link.href}`

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/35 backdrop-blur-md border-b border-neutral-900/10 shadow-xs"
          : "bg-transparent",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-in-out",
          isScrolled ? "h-16" : "h-20",
        )}
      >
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault()
              setActiveId("home")
              window.scrollTo({ top: 0, behavior: "smooth" })
              window.history.replaceState(null, "", window.location.pathname)
            }
          }}
          className={cn(
            "flex items-center gap-2 text-base font-semibold transition-colors duration-300 hover:opacity-85",
            isScrolled ? "text-neutral-900" : "text-white",
          )}
        >
          <Building2 className="size-5" />
          Real Estate
        </Link>

        {/* Desktop Nav with Smooth Sliding Active Pill Indicator */}
        <nav
          ref={navRef}
          className={cn(
            "relative hidden items-center rounded-full p-1 backdrop-blur-sm transition-all duration-300 lg:flex",
            isScrolled
              ? "bg-neutral-900/5 ring-1 ring-neutral-900/10 shadow-xs"
              : "bg-white/10 ring-1 ring-white/20",
          )}
        >
          {/* Animated sliding pill background */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute rounded-full shadow-xs transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
              isScrolled ? "bg-neutral-900" : "bg-white",
            )}
            style={{
              left: `${indicator.left}px`,
              top: `${indicator.top}px`,
              width: `${indicator.width}px`,
              height: `${indicator.height}px`,
              opacity: indicator.opacity,
            }}
          />

          {navLinks.map((link) => {
            const isActive = activeId === link.id
            const isInitialInactivePill = isActive && indicator.opacity === 0
            const isScrollAnchor = link.type === "anchor" && isLanding

            return (
              <a
                key={link.id}
                ref={(el) => {
                  itemRefs.current[link.id] = el
                }}
                href={hrefFor(link)}
                onClick={
                  isScrollAnchor ? (e) => handleNavClick(e, link) : undefined
                }
                className={cn(
                  "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                  isActive
                    ? isScrolled
                      ? "text-white"
                      : "text-neutral-900"
                    : isScrolled
                      ? "text-neutral-600 hover:text-neutral-900"
                      : "text-white/80 hover:text-white",
                  isInitialInactivePill &&
                    (isScrolled ? "bg-neutral-900" : "bg-white"),
                )}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={isSignedIn ? "/dashboard" : "/login"}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-green-700 hover:shadow-md"
          >
            {isSignedIn ? "Dashboard" : "Sign In"}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full transition-all lg:hidden",
              isScrolled
                ? "text-neutral-900 ring-1 ring-neutral-900/15 hover:bg-neutral-900/5"
                : "text-white ring-1 ring-white/25 hover:bg-white/10",
            )}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu with Smooth Transition */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out lg:hidden",
          menuOpen
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        <div
          className={cn(
            "mx-4 mt-2 rounded-2xl p-3 shadow-2xl backdrop-blur-xl sm:mx-6 transition-colors duration-300",
            isScrolled
              ? "bg-white/85 ring-1 ring-neutral-900/10 shadow-xl"
              : "bg-neutral-950/95 ring-1 ring-white/15",
          )}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = activeId === link.id
              const isScrollAnchor = link.type === "anchor" && isLanding

              return (
                <a
                  key={link.id}
                  href={hrefFor(link)}
                  onClick={(e) => {
                    if (isScrollAnchor) handleNavClick(e, link)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? isScrolled
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-white text-neutral-900 shadow-xs"
                      : isScrolled
                        ? "text-neutral-700 hover:bg-neutral-900/5 hover:text-neutral-900"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isScrolled ? "bg-white" : "bg-neutral-900",
                      )}
                    />
                  )}
                </a>
              )
            })}
            <div
              className={cn(
                "my-1 border-t",
                isScrolled ? "border-neutral-900/10" : "border-white/10",
              )}
            />
            <Link
              href={isSignedIn ? "/dashboard" : "/login"}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                isScrolled
                  ? "text-neutral-700 hover:bg-neutral-900/5 hover:text-neutral-900"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {isSignedIn ? "Dashboard" : "Log in"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
