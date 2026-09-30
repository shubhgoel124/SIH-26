"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: { hours: number; minutes: number } | null
  onChange?: (value: { hours: number; minutes: number } | null) => void
  placeholder?: string
  disabled?: boolean
  minuteStep?: number
  minHour?: number
  maxHour?: number
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  minuteStep = 15,
  minHour = 9,
  maxHour = 18,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Generate hours array (business hours)
  const hours = React.useMemo(() => {
    const result: number[] = []
    for (let h = minHour; h < maxHour; h++) {
      result.push(h)
    }
    return result
  }, [minHour, maxHour])

  // Generate minutes array
  const minutes = React.useMemo(() => {
    const result: number[] = []
    for (let m = 0; m < 60; m += minuteStep) {
      result.push(m)
    }
    return result
  }, [minuteStep])

  const formatTime = (hours: number, minutes: number) => {
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, "0")
    return `${displayHours}:${displayMinutes} ${period}`
  }

  const handleSelect = (hours: number, minutes: number) => {
    onChange?.({ hours, minutes })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value.hours, value.minutes) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex max-h-64">
          {/* Hours Column */}
          <div className="flex flex-col overflow-y-auto border-r border-slate-100">
            <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 border-b">
              Hour
            </div>
            {hours.map((hour) => {
              const period = hour >= 12 ? "PM" : "AM"
              const displayHour = hour % 12 || 12
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => handleSelect(hour, value?.minutes ?? 0)}
                  className={cn(
                    "px-4 py-1.5 text-sm hover:bg-sky-50 transition-colors text-left whitespace-nowrap",
                    value?.hours === hour && "bg-sky-100 text-sky-700 font-medium"
                  )}
                >
                  {displayHour} {period}
                </button>
              )
            })}
          </div>
          {/* Minutes Column */}
          <div className="flex flex-col overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 border-b">
              Min
            </div>
            {minutes.map((minute) => (
              <button
                key={minute}
                type="button"
                onClick={() => handleSelect(value?.hours ?? minHour, minute)}
                className={cn(
                  "px-4 py-1.5 text-sm hover:bg-sky-50 transition-colors text-left",
                  value?.minutes === minute && "bg-sky-100 text-sky-700 font-medium"
                )}
              >
                {minute.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
