"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RotateCcw, TriangleAlert } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <TriangleAlert className="size-4" />
        </div>
        <CardTitle className="mt-3 text-base">Something went wrong</CardTitle>
        <CardDescription>
          {error.message || "This page could not be loaded."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => reset()}>
          <RotateCcw />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
