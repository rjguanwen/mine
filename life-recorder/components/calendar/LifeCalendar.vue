<template>
  <div class="life-calendar">
    <!-- Controls -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UButtonGroup>
          <UButton
            :variant="view === 'week' ? 'solid' : 'outline'"
            size="sm"
            @click="view = 'week'"
          >
            周视图
          </UButton>
          <UButton
            :variant="view === 'month' ? 'solid' : 'outline'"
            size="sm"
            @click="view = 'month'"
          >
            月视图
          </UButton>
        </UButtonGroup>
      </div>
      <div class="text-sm text-gray-500">
        每{{ view === 'week' ? '格=1周' : '格=1月' }}，每行=1年
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="overflow-auto relative" ref="gridContainer">
      <!-- Year labels -->
      <div
        class="calendar-grid"
        :style="gridStyle"
        @click="handleCellClick"
        @mouseover="handleCellHover"
        @mouseleave="hoveredCell = null"
      >
        <template v-for="(row, yearIdx) in grid" :key="yearIdx">
          <div
            v-for="(cell, periodIdx) in row"
            :key="`${yearIdx}-${periodIdx}`"
            class="calendar-cell"
            :class="getCellClass(cell, yearIdx, periodIdx)"
            :data-year="yearIdx"
            :data-period="periodIdx"
            :title="getCellTitle(cell, yearIdx)"
          />
        </template>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-4 text-xs text-gray-500">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-gray-200" />
        <span>已度过</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-blue-400" />
        <span>有记录</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-amber-400" />
        <span>有大事记</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-green-500 ring-2 ring-green-300" />
        <span>当前</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-purple-200" />
        <span>有规划</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm bg-gray-100" />
        <span>未来</span>
      </div>
    </div>

    <!-- Detail Panel -->
    <USlideover v-model="showDetail">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">时段详情</h3>
        </template>
        <div v-if="selectedCell" class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">时间范围</h3>
            <p class="text-gray-900">{{ selectedCell.startDate }} ~ {{ selectedCell.endDate }}</p>
            <p class="text-sm text-gray-500">第 {{ selectedCell.year + 1 }} 年</p>
          </div>

          <div v-if="selectedCellData.milestones.length">
            <h3 class="text-sm font-medium text-gray-500 mb-2">大事记</h3>
            <div v-for="m in selectedCellData.milestones" :key="m.id" class="p-2 bg-amber-50 rounded mb-1">
              <NuxtLink :to="`/milestones/${m.id}`" class="text-sm font-medium text-amber-800 hover:underline">
                {{ m.title }}
              </NuxtLink>
              <span class="text-xs text-amber-600 ml-2">{{ m.category }}</span>
            </div>
          </div>

          <div v-if="selectedCellData.recordCount > 0">
            <h3 class="text-sm font-medium text-gray-500">日常记录</h3>
            <p class="text-gray-900">{{ selectedCellData.recordCount }} 条记录</p>
            <NuxtLink
              :to="`/records?from=${selectedCell.startDate}&to=${selectedCell.endDate}`"
              class="text-sm text-blue-600 hover:underline"
            >
              查看记录
            </NuxtLink>
          </div>

          <div v-if="selectedCellData.plans.length">
            <h3 class="text-sm font-medium text-gray-500 mb-2">规划</h3>
            <div v-for="p in selectedCellData.plans" :key="p.id" class="p-2 bg-purple-50 rounded mb-1">
              <NuxtLink :to="`/plans/${p.id}`" class="text-sm font-medium text-purple-800 hover:underline">
                {{ p.title }}
              </NuxtLink>
              <span class="text-xs text-purple-600 ml-2">{{ p.status }}</span>
            </div>
          </div>

          <div v-if="!selectedCellData.milestones.length && selectedCellData.recordCount === 0 && !selectedCellData.plans.length">
            <p class="text-gray-400 text-sm">该时段暂无记录</p>
            <div class="flex gap-2 mt-3">
              <UButton size="sm" variant="outline" @click="navigateTo('/records')">写日记</UButton>
              <UButton size="sm" variant="outline" @click="navigateTo('/milestones')">记大事</UButton>
            </div>
          </div>
        </div>
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { CalendarPeriod } from '~/composables/useLifeCalendar'

const props = defineProps<{
  birthDate: string
  lifespan: number
  summaryData?: {
    records: Array<{ recordDate: string; count: number }>
    milestones: Array<{ id: number; title: string; category: string; eventDate: string; importance: number }>
    plans: Array<{ id: number; title: string; targetDate: string | null; startDate: string | null; status: string }>
  }
  compact?: boolean
}>()

const { view, generateGrid } = useLifeCalendar()

const grid = computed(() => generateGrid(props.birthDate, props.lifespan))
const hoveredCell = ref<CalendarPeriod | null>(null)
const selectedCell = ref<CalendarPeriod | null>(null)
const showDetail = ref(false)
const gridContainer = ref<HTMLElement>()

const cols = computed(() => view.value === 'week' ? 52 : 12)
const cellSize = computed(() => props.compact ? (view.value === 'week' ? 6 : 14) : (view.value === 'week' ? 10 : 22))
const gap = computed(() => props.compact ? 1 : 2)

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols.value}, ${cellSize.value}px)`,
  gap: `${gap.value}px`,
}))

// Build lookup maps for fast cell coloring
const recordMap = computed(() => {
  const map = new Map<string, number>()
  if (!props.summaryData?.records) return map
  for (const r of props.summaryData.records) {
    map.set(r.recordDate, r.count)
  }
  return map
})

const milestoneMap = computed(() => {
  const map = new Map<string, typeof props.summaryData.milestones>()
  if (!props.summaryData?.milestones) return map
  for (const m of props.summaryData.milestones) {
    const key = m.eventDate
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return map
})

function cellHasRecords(cell: CalendarPeriod): number {
  let count = 0
  const start = dayjs(cell.startDate)
  const end = dayjs(cell.endDate)
  for (const [date, c] of recordMap.value) {
    const d = dayjs(date)
    if (!d.isBefore(start) && !d.isAfter(end)) {
      count += c
    }
  }
  return count
}

function cellMilestones(cell: CalendarPeriod) {
  const result: Array<{ id: number; title: string; category: string }> = []
  const start = dayjs(cell.startDate)
  const end = dayjs(cell.endDate)
  for (const [date, ms] of milestoneMap.value) {
    const d = dayjs(date)
    if (!d.isBefore(start) && !d.isAfter(end)) {
      result.push(...ms)
    }
  }
  return result
}

function cellPlans(cell: CalendarPeriod) {
  if (!props.summaryData?.plans) return []
  const start = dayjs(cell.startDate)
  const end = dayjs(cell.endDate)
  return props.summaryData.plans.filter(p => {
    const td = p.targetDate ? dayjs(p.targetDate) : null
    const sd = p.startDate ? dayjs(p.startDate) : null
    if (td && !td.isBefore(start) && !td.isAfter(end)) return true
    if (sd && !sd.isBefore(start) && !sd.isAfter(end)) return true
    return false
  })
}

function getCellClass(cell: CalendarPeriod, yearIdx: number, periodIdx: number): string {
  const classes = ['rounded-[1px]', 'cursor-pointer', 'transition-all', 'duration-100']

  if (!cell.isBorn) {
    classes.push('bg-transparent')
    return classes.join(' ')
  }

  if (cell.isCurrent) {
    classes.push('bg-green-500', 'ring-2', 'ring-green-300')
    return classes.join(' ')
  }

  if (cell.isPast) {
    const ms = cellMilestones(cell)
    const rc = cellHasRecords(cell)

    if (ms.length > 0) {
      classes.push('bg-amber-400')
    } else if (rc > 0) {
      const intensity = Math.min(rc, 5)
      const blues = ['bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600']
      classes.push(blues[Math.min(intensity - 1, 4)])
    } else {
      classes.push('bg-gray-200')
    }
  } else {
    const ps = cellPlans(cell)
    if (ps.length > 0) {
      classes.push('bg-purple-200')
    } else {
      classes.push('bg-gray-100')
    }
  }

  return classes.join(' ')
}

function getCellTitle(cell: CalendarPeriod, yearIdx: number): string {
  if (!cell.isBorn) return ''
  return `第${yearIdx + 1}年 | ${cell.startDate} ~ ${cell.endDate}`
}

const selectedCellData = computed(() => {
  if (!selectedCell.value) return { milestones: [], recordCount: 0, plans: [] }
  return {
    milestones: cellMilestones(selectedCell.value),
    recordCount: cellHasRecords(selectedCell.value),
    plans: cellPlans(selectedCell.value),
  }
})

function handleCellClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const year = target.dataset.year
  const period = target.dataset.period
  if (year === undefined || period === undefined) return

  const y = parseInt(year)
  const p = parseInt(period)
  const cell = grid.value[y]?.[p]
  if (!cell || !cell.isBorn) return

  selectedCell.value = cell
  showDetail.value = true
}

function handleCellHover(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.dataset.year !== undefined) {
    hoveredCell.value = grid.value[parseInt(target.dataset.year)]?.[parseInt(target.dataset.period)] || null
  }
}
</script>

<style scoped>
.calendar-cell {
  aspect-ratio: 1;
}

.calendar-cell:hover {
  opacity: 0.75;
  transform: scale(1.5);
  z-index: 10;
  position: relative;
}
</style>
