"use client"

import type { ReactNode } from "react"
import { track } from "@/lib/analytics/track"

export function TrackedLink({
  href,
  trackEvent,
  trackData,
  className,
  children,
}: {
  href: string
  trackEvent: string
  trackData?: Record<string, unknown>
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track(trackEvent, trackData)}
    >
      {children}
    </a>
  )
}
