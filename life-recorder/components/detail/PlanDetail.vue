<template>
  <div class="space-y-5">
    <!-- Priority + Status -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="priorityBadge(item.priority)">
        {{ priorityLabel(item.priority) }}
      </span>
      <span class="flex items-center gap-1.5 text-sm text-gray-600">
        <span class="w-2.5 h-2.5 rounded-full inline-block" :class="statusColor(item.status)" />
        {{ statusLabel(item.status) }}
      </span>
    </div>

    <!-- Title -->
    <h2 class="text-xl font-bold text-gray-900">{{ item.title }}</h2>

    <!-- Description -->
    <div v-if="item.description" class="prose prose-sm max-w-none text-gray-700" v-html="item.description" />

    <!-- Dates -->
    <div class="space-y-2">
      <div v-if="item.startDate" class="flex items-center gap-2 text-sm text-gray-500">
        <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
        <span>开始日期: {{ item.startDate }}</span>
      </div>
      <div v-if="item.targetDate" class="flex items-center gap-2 text-sm text-gray-500">
        <UIcon name="i-heroicons-flag" class="w-4 h-4" />
        <span>目标日期: {{ item.targetDate }}</span>
      </div>
    </div>

    <!-- Linked milestone -->
    <div v-if="item.linkedMilestoneId" class="flex items-center gap-1.5 text-sm text-amber-600">
      <UIcon name="i-heroicons-link" class="w-4 h-4" />
      <span>已关联大事记</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { priorityBadge, priorityLabel, statusLabel, statusColor } = usePlanHelpers()

defineProps<{
  item: any
}>()
</script>
