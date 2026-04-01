<template>
  <div class="space-y-5">
    <!-- Date + Mood + Weather -->
    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-500">{{ item.recordDate }}</span>
      <span v-if="item.mood" class="text-2xl" :title="moodText(item.mood)">{{ moodEmoji(item.mood) }}</span>
      <span v-if="item.weather" class="text-sm text-gray-400">{{ item.weather }}</span>
    </div>

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
  </div>
</template>

<script setup lang="ts">
const { moodEmoji, moodText } = useMoodMap()

defineProps<{
  item: any
}>()
</script>
