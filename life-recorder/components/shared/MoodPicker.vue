<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="m in moods"
      :key="m.value"
      @click="emit('update:modelValue', modelValue === m.value ? null : m.value)"
      class="px-3 py-1.5 rounded-full text-sm border transition-all"
      :class="modelValue === m.value
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 hover:border-gray-300 text-gray-600'"
    >
      {{ m.emoji }} {{ m.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const moods = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'excited', emoji: '🤩', label: '兴奋' },
  { value: 'grateful', emoji: '🙏', label: '感恩' },
  { value: 'neutral', emoji: '😐', label: '平淡' },
  { value: 'tired', emoji: '😴', label: '疲惫' },
  { value: 'anxious', emoji: '😰', label: '焦虑' },
  { value: 'sad', emoji: '😢', label: '难过' },
  { value: 'angry', emoji: '😤', label: '生气' },
]
</script>
