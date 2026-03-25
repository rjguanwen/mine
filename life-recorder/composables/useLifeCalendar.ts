import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export interface CalendarPeriod {
  year: number
  period: number
  startDate: string
  endDate: string
  isPast: boolean
  isCurrent: boolean
  isBorn: boolean
}

export interface CalendarSummaryItem {
  year: number
  period: number
  recordCount: number
  milestoneCount: number
  planCount: number
  ideaCount: number
  milestones: Array<{ id: number; title: string; category: string }>
}

export type CalendarView = 'week' | 'month'

export function useLifeCalendar() {
  const view = ref<CalendarView>('week')

  function generateGrid(birthDate: string, lifespan: number): CalendarPeriod[][] {
    const birth = dayjs(birthDate)
    const now = dayjs()
    const grid: CalendarPeriod[][] = []

    if (view.value === 'week') {
      // Each row = 1 year, each column = 1 week (52 weeks)
      for (let yearIdx = 0; yearIdx < lifespan; yearIdx++) {
        const row: CalendarPeriod[] = []
        for (let weekIdx = 0; weekIdx < 52; weekIdx++) {
          const weekStart = birth.add(yearIdx * 52 + weekIdx, 'week')
          const weekEnd = weekStart.add(6, 'day')

          const isPast = weekEnd.isBefore(now)
          const isCurrent = !weekStart.isAfter(now) && !weekEnd.isBefore(now)
          const isBorn = !weekStart.isBefore(birth)

          row.push({
            year: yearIdx,
            period: weekIdx,
            startDate: weekStart.format('YYYY-MM-DD'),
            endDate: weekEnd.format('YYYY-MM-DD'),
            isPast,
            isCurrent,
            isBorn,
          })
        }
        grid.push(row)
      }
    } else {
      // Each row = 1 year, each column = 1 month (12 months)
      for (let yearIdx = 0; yearIdx < lifespan; yearIdx++) {
        const row: CalendarPeriod[] = []
        for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
          const monthStart = birth.add(yearIdx, 'year').add(monthIdx, 'month')
          const monthEnd = monthStart.endOf('month')

          const isPast = monthEnd.isBefore(now)
          const isCurrent = !monthStart.isAfter(now) && !monthEnd.isBefore(now)
          const isBorn = !monthStart.isBefore(birth)

          row.push({
            year: yearIdx,
            period: monthIdx,
            startDate: monthStart.format('YYYY-MM-DD'),
            endDate: monthEnd.format('YYYY-MM-DD'),
            isPast,
            isCurrent,
            isBorn,
          })
        }
        grid.push(row)
      }
    }

    return grid
  }

  function getLifeStats(birthDate: string, lifespan: number) {
    const birth = dayjs(birthDate)
    const now = dayjs()
    const totalWeeks = lifespan * 52
    const livedWeeks = Math.floor(now.diff(birth, 'week'))
    const livedDays = now.diff(birth, 'day')
    const livedYears = now.diff(birth, 'year')
    const percentage = Math.min(100, Math.round((livedWeeks / totalWeeks) * 1000) / 10)

    return {
      totalWeeks,
      livedWeeks: Math.max(0, livedWeeks),
      remainingWeeks: Math.max(0, totalWeeks - livedWeeks),
      livedDays: Math.max(0, livedDays),
      livedYears,
      percentage,
    }
  }

  return {
    view,
    generateGrid,
    getLifeStats,
  }
}
