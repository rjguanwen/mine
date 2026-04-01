<template>
  <div class="space-y-5">
    <!-- Title -->
    <h2 v-if="item.title" class="text-xl font-bold text-gray-900">{{ item.title }}</h2>

    <!-- Content -->
    <div v-if="item.content" class="prose prose-sm max-w-none text-gray-700" v-html="item.content" />

    <!-- Media -->
    <div v-if="item.media?.length" class="space-y-3">
      <template v-for="m in item.media" :key="m.id">
        <img
          v-if="m.mimeType?.startsWith('image/')"
          :src="m.url"
          :alt="m.fileName"
          class="w-full rounded-lg object-cover max-h-96"
        />
        <video
          v-else-if="m.mimeType?.startsWith('video/')"
          :src="m.url"
          controls
          class="w-full rounded-lg max-h-96"
        />
      </template>
    </div>

    <!-- Tags -->
    <div v-if="item.tags?.length" class="flex gap-1.5 flex-wrap">
      <span v-for="tag in item.tags" :key="tag.id"
        class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
        {{ tag.name }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100">
      <span>{{ item.createdAt?.slice(0, 10) }}</span>
      <span v-if="item.linkedPlanId" class="text-purple-500 flex items-center gap-1">
        <UIcon name="i-heroicons-link" class="w-3 h-3" /> 已关联规划
      </span>
      <span v-if="item.linkedMilestoneId" class="text-amber-500 flex items-center gap-1">
        <UIcon name="i-heroicons-link" class="w-3 h-3" /> 已关联大事记
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  item: any
}>()
</script>
