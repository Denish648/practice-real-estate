type StatCardProps = {
  label: string
  value: string | number
  icon: React.ReactNode
}

/** Mirrors the stats strip on the landing page: big tabular number, quiet label. */
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl bg-secondary p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <span className="shrink-0 text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
      </div>

      <p className="truncate text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
    </div>
  )
}
