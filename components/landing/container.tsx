import { cn } from "cn"

/** Shared page gutter for every landing section. */
export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-300 px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  )
}
