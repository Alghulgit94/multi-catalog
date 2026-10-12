"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TODOS = "__todos__"

/** Filtro de listado. `value` vacío = sin filtro (Radix Select no admite ""). */
export function FilterSelect({
  value,
  onChange,
  allLabel,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  allLabel: string
  options: { value: string; label: string }[]
  label: string
}) {
  return (
    <Select value={value || TODOS} onValueChange={(v) => onChange(v === TODOS ? "" : v)}>
      <SelectTrigger size="sm" className="h-9 min-w-[150px] rounded-[10px] text-sm" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
