"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-slate-900",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-8 w-8 bg-white border border-slate-200 rounded-full p-0 opacity-70 hover:opacity-100 hover:bg-sky-50 hover:border-sky-200 transition-colors absolute left-1 inline-flex items-center justify-center"
        ),
        button_next: cn(
          "h-8 w-8 bg-white border border-slate-200 rounded-full p-0 opacity-70 hover:opacity-100 hover:bg-sky-50 hover:border-sky-200 transition-colors absolute right-1 inline-flex items-center justify-center"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-slate-500 rounded-md w-10 font-medium text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-10 w-10 text-center text-sm p-0 relative rounded-xl focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-10 w-10 p-0 font-normal rounded-xl transition-colors",
          "hover:bg-sky-50 hover:text-sky-700",
          "aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected: "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 rounded-xl shadow-md",
        today: "bg-slate-100 text-slate-900 font-semibold",
        outside: "day-outside text-slate-300 aria-selected:bg-sky-50/50 aria-selected:text-slate-400",
        disabled: "text-slate-300 opacity-50 cursor-not-allowed hover:bg-transparent",
        range_middle: "aria-selected:bg-sky-50 aria-selected:text-sky-700",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4 text-slate-600" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
