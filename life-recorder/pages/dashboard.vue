<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">概览</h1>
      <p class="text-gray-500 mt-1">你的人生全景</p>
    </div>

    <!-- Life Stats -->
    <ClientOnly>
      <div v-if="user?.birthDate" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard v-for="stat in stats" :key="stat.label">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
          </div>
        </UCard>
      </div>
    </ClientOnly>

    <!-- Life Calendar -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">人生日历</h2>
          <NuxtLink to="/calendar" class="text-sm text-blue-600 hover:underline">全屏查看</NuxtLink>
        </div>
      </template>
      <ClientOnly>
        <CalendarLifeCalendar
          v-if="user?.birthDate"
          :birth-date="user.birthDate"
          :lifespan="user.expectedLifespan || 80"
          :summary-data="summaryData"
          compact
        />
      </ClientOnly>
    </UCard>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UButton
        block
        variant="outline"
        size="lg"
        icon="i-heroicons-pencil-square"
        @click="navigateTo('/records')"
      >
        写日记
      </UButton>
      <UButton
        block
        variant="outline"
        size="lg"
        icon="i-heroicons-trophy"
        @click="navigateTo('/milestones')"
      >
        记大事
      </UButton>
      <UButton
        block
        variant="outline"
        size="lg"
        icon="i-heroicons-flag"
        @click="navigateTo('/plans')"
      >
        做规划
      </UButton>
      <UButton
        block
        variant="outline"
        size="lg"
        icon="i-heroicons-light-bulb"
        @click="navigateTo('/ideas')"
      >
        记灵感
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { getLifeStats } = useLifeCalendar()

const { data: summaryData } = await useFetch('/api/calendar/summary')

const stats = computed(() => {
  if (!user.value?.birthDate) return []
  const s = getLifeStats(user.value.birthDate, user.value.expectedLifespan || 80)
  return [
    { label: '已度过的周', value: s.livedWeeks.toLocaleString() },
    { label: '剩余的周', value: s.remainingWeeks.toLocaleString() },
    { label: '已度过天数', value: s.livedDays.toLocaleString() },
    { label: '人生进度', value: `${s.percentage}%` },
  ]
})
</script>
