"use client"

import clsx from "clsx"
import { format, parseISO } from "date-fns"
import { useMemo } from "react"
import type { ContributionWeek } from "./types"

type ContributionHeatmapProps = {
  weeks: ContributionWeek[]
}

const LEVEL_CLASS = [
  "bg-dev-inset",
  "bg-dev-accent-green/30",
  "bg-dev-accent-green/50",
  "bg-dev-accent-green/75",
  "bg-dev-accent-green",
] as const

const CELL = 12
const GAP = 3
const GUTTER_WIDTH = 28

const WEEKDAY_ROWS = [
  { weekday: 0, label: "" },
  { weekday: 1, label: "Mon" },
  { weekday: 2, label: "" },
  { weekday: 3, label: "Wed" },
  { weekday: 4, label: "" },
  { weekday: 5, label: "Fri" },
  { weekday: 6, label: "" },
]

export function ContributionHeatmap({ weeks }: ContributionHeatmapProps) {
  const months = useMemo(() => {
    const labels: { name: string; startCol: number; endCol: number }[] = []
    let current: { name: string; startCol: number } | null = null
    for (let col = 0; col < weeks.length; col++) {
      const firstDay = weeks[col].contributionDays[0]
      if (!firstDay) continue
      const name = format(parseISO(firstDay.date), "MMM")
      if (!current || current.name !== name) {
        if (current) labels.push({ ...current, endCol: col })
        current = { name, startCol: col }
      }
    }
    if (current) labels.push({ ...current, endCol: weeks.length })
    return labels
  }, [weeks])

  return (
    <div className="overflow-x-auto pb-2">
      <div style={{ width: "fit-content" }}>
        <div
          className="flex"
          style={{ gap: GAP }}
        >
          <div style={{ width: GUTTER_WIDTH }} />
          <div
            className="grid"
            style={{
              gridAutoFlow: "column",
              gridAutoColumns: CELL,
              columnGap: GAP,
              height: 16,
            }}
          >
            {months.map((month) => (
              <span
                key={`${month.name}-${month.startCol}`}
                style={{
                  gridColumn: `${month.startCol + 1} / ${month.endCol + 1}`,
                }}
                className="overflow-hidden text-[10px] leading-4 text-dev-text-secondary"
              >
                {month.name}
              </span>
            ))}
          </div>
        </div>

        <div
          className="mt-1 flex"
          style={{ gap: GAP }}
        >
          <div
            className="grid"
            style={{
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              rowGap: GAP,
              width: GUTTER_WIDTH,
            }}
          >
            {WEEKDAY_ROWS.map((row) => (
              <span
                key={row.weekday}
                className="text-[10px] leading-3 text-dev-text-secondary"
              >
                {row.label}
              </span>
            ))}
          </div>

          <div
            className="grid"
            style={{
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              gridAutoFlow: "column",
              gridAutoColumns: CELL,
              columnGap: GAP,
              rowGap: GAP,
            }}
          >
            {weeks.flatMap((week) =>
              week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  title={`${day.contributionCount} contribution${
                    day.contributionCount === 1 ? "" : "s"
                  } on ${day.date}`}
                  className={clsx(
                    "rounded-[3px]",
                    LEVEL_CLASS[day.intensityLevel] ?? LEVEL_CLASS[0],
                  )}
                  style={{ width: CELL, height: CELL }}
                />
              )),
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1">
          <span className="mr-1 text-[10px] text-dev-text-secondary">Less</span>
          {LEVEL_CLASS.map((levelClass) => (
            <span
              key={levelClass}
              className={clsx("rounded-[2px]", levelClass)}
              style={{ width: 10, height: 10 }}
            />
          ))}
          <span className="ml-1 text-[10px] text-dev-text-secondary">More</span>
        </div>
      </div>
    </div>
  )
}
