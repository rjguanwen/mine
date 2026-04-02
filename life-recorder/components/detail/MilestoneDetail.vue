<template>
  <div class="space-y-5">
    <!-- Date + Category + Importance -->
    <div class="space-y-2">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-500">{{ item.eventDate }}</span>
        <span v-if="item.endDate" class="text-sm text-gray-400">~ {{ item.endDate }}</span>
        <span class="px-2 py-0.5 text-xs rounded-full" :class="categoryBadge(item.category)">
          {{ categoryLabel(item.category) }}
        </span>
      </div>
      <div class="flex gap-0.5">
        <span v-for="i in 5" :key="i" class="text-base" :class="i <= item.importance ? 'text-amber-400' : 'text-gray-200'">&#9733;</span>
      </div>
    </div>

    <!-- Title -->
    <h2 class="text-xl font-bold text-gray-900">{{ item.title }}</h2>

    <!-- Description -->
    <div v-if="item.description" class="prose prose-sm max-w-none text-gray-700" v-html="item.description" />

    <!-- Media -->
    <div v-if="item.media?.length" class="space-y-3">
      <template v-for="m in item.media" :key="m.id">
        <img
          v-if="m.mimeType?.startsWith('image/')"
          :src="m.url"
          :alt="m.fileName"
          class="w-full rounded-lg object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
          @click="openLightbox(m.url, m.fileName)"
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

    <SharedImageLightbox v-model:visible="lightboxVisible" :src="lightboxSrc" :alt="lightboxAlt" />
  </div>
</template>

<script setup lang="ts">
const { categoryBadge, categoryLabel } = useMilestoneHelpers()

defineProps<{
  item: any
}>()

const lightboxVisible = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

function openLightbox(src: string, alt?: string) {
  lightboxSrc.value = src
  lightboxAlt.value = alt || ''
  lightboxVisible.value = true
}
</script>
