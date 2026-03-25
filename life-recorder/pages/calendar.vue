<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">人生日历</h1>
      <p class="text-gray-500 mt-1">你的一生，一目了然</p>
    </div>

    <!-- Life Stats Bar -->
    <ClientOnly>
      <div v-if="user?.birthDate" class="flex items-center gap-6 text-sm text-gray-600">
        <span>已度过 <strong class="text-gray-900">{{ lifeStats.livedWeeks }}</strong> 周</span>
        <span>剩余 <strong class="text-gray-900">{{ lifeStats.remainingWeeks }}</strong> 周</span>
        <span>人生进度 <strong class="text-gray-900">{{ lifeStats.percentage }}%</strong></span>
      </div>
    </ClientOnly>

    <!-- Calendar -->
    <UCard>
      <ClientOnly>
        <CalendarLifeCalendar
          v-if="user?.birthDate"
          :birth-date="user.birthDate"
          :lifespan="user.expectedLifespan || 80"
          :summary-data="summaryData"
        />
      </ClientOnly>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { getLifeStats } = useLifeCalendar()

const { data: summaryData } = await useFetch('/api/calendar/summary')

const lifeStats = computed(() => {
  if (!user.value?.birthDate) return { livedWeeks: 0, remainingWeeks: 0, percentage: 0 }
  return getLifeStats(user.value.birthDate, user.value.expectedLifespan || 80)
})
</script>
