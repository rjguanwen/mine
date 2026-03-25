<template>
  <div class="flex flex-wrap gap-2 items-center">
    <span
      v-for="tag in selectedTags"
      :key="tag.id"
      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      :style="{ backgroundColor: (tag.color || '#e5e7eb') + '20', color: tag.color || '#374151' }"
    >
      {{ tag.name }}
      <button @click="removeTag(tag.id)" class="hover:opacity-70">
        <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
      </button>
    </span>
    <div class="relative">
      <input
        v-model="inputValue"
        @keydown.enter.prevent="createOrSelectTag"
        @focus="showDropdown = true"
        placeholder="添加标签..."
        class="text-sm border-0 outline-none bg-transparent w-24 focus:w-32 transition-all"
      />
      <div
        v-if="showDropdown && filteredTags.length > 0"
        class="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-auto"
      >
        <button
          v-for="tag in filteredTags"
          :key="tag.id"
          @mousedown.prevent="selectTag(tag)"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tag {
  id: number
  name: string
  color: string | null
}

const props = defineProps<{
  modelValue?: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const inputValue = ref('')
const showDropdown = ref(false)
const allTags = ref<Tag[]>([])

const selectedTagIds = computed(() => props.modelValue || [])
const selectedTags = computed(() => allTags.value.filter(t => selectedTagIds.value.includes(t.id)))
const filteredTags = computed(() => {
  return allTags.value
    .filter(t => !selectedTagIds.value.includes(t.id))
    .filter(t => !inputValue.value || t.name.toLowerCase().includes(inputValue.value.toLowerCase()))
})

onMounted(async () => {
  try {
    allTags.value = await $fetch<Tag[]>('/api/tags')
  } catch {}
})

function selectTag(tag: Tag) {
  emit('update:modelValue', [...selectedTagIds.value, tag.id])
  inputValue.value = ''
  showDropdown.value = false
}

function removeTag(tagId: number) {
  emit('update:modelValue', selectedTagIds.value.filter(id => id !== tagId))
}

async function createOrSelectTag() {
  const name = inputValue.value.trim()
  if (!name) return

  const existing = allTags.value.find(t => t.name.toLowerCase() === name.toLowerCase())
  if (existing) {
    selectTag(existing)
    return
  }

  try {
    const tag = await $fetch<Tag>('/api/tags', { method: 'POST', body: { name } })
    allTags.value.push(tag)
    selectTag(tag)
  } catch {}
}

onClickOutside(ref(null), () => {
  showDropdown.value = false
})
</script>
