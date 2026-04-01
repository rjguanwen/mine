<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">人生大事记</h1>
        <p class="text-gray-500 mt-1">记录人生中的重要时刻</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showForm = true">记录大事</UButton>
    </div>

    <!-- Category Filter -->
    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="cat in categories"
        :key="cat.value"
        :variant="selectedCategory === cat.value ? 'solid' : 'outline'"
        size="sm"
        @click="selectedCategory = selectedCategory === cat.value ? '' : cat.value"
      >
        {{ cat.label }}
      </UButton>
    </div>

    <!-- Timeline -->
    <div v-if="filteredItems.length" class="relative pl-8">
      <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div v-for="milestone in filteredItems" :key="milestone.id" class="relative mb-8">
        <div class="absolute -left-5 w-4 h-4 rounded-full border-2 border-white shadow"
          :class="categoryColor(milestone.category)" />
        <UCard class="hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex-1 cursor-pointer" @click="viewMilestone(milestone)">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm text-gray-500">{{ milestone.eventDate }}</span>
                <span class="px-2 py-0.5 text-xs rounded-full"
                  :class="categoryBadge(milestone.category)">
                  {{ categoryLabel(milestone.category) }}
                </span>
                <span v-for="i in milestone.importance" :key="i" class="text-amber-400 text-xs">&#9733;</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ milestone.title }}</h3>
              <div v-if="milestone.description" class="text-gray-600 text-sm line-clamp-3 prose prose-sm" v-html="milestone.description" />
              <div v-if="milestone.media?.length" class="flex gap-2 mt-3">
                <img v-for="m in milestone.media.filter((x: any) => x.mimeType?.startsWith('image/'))" :key="m.id"
                  :src="m.url" class="w-20 h-20 object-cover rounded" />
              </div>
            </div>
            <div class="flex gap-1 ml-4">
              <UButton variant="ghost" size="xs" icon="i-heroicons-pencil" @click="editMilestone(milestone)" />
              <UButton variant="ghost" size="xs" icon="i-heroicons-trash" color="red" @click="deleteMilestone(milestone.id)" />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
      <UIcon name="i-heroicons-trophy" class="w-12 h-12 mx-auto mb-3" />
      <p>还没有大事记，记录你人生中的重要时刻吧</p>
    </div>

    <!-- Form Modal -->
    <UModal v-model="showForm">
      <UCard>
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-semibold">{{ editingId ? '编辑大事记' : '新增大事记' }}</h2>
          <UFormGroup label="标题" required>
            <UInput v-model="form.title" placeholder="事件名称" class="w-full" />
          </UFormGroup>
          <UFormGroup label="日期" required>
            <UInput v-model="form.eventDate" type="date" class="w-full" />
          </UFormGroup>
          <UFormGroup label="分类">
            <USelect v-model="form.category" :options="categories" value-attribute="value" option-attribute="label" class="w-full" />
          </UFormGroup>
          <UFormGroup label="重要程度">
            <div class="flex gap-1">
              <button v-for="i in 5" :key="i" @click="form.importance = i"
                class="text-xl" :class="i <= form.importance ? 'text-amber-400' : 'text-gray-300'">
                &#9733;
              </button>
            </div>
          </UFormGroup>
          <UFormGroup label="描述">
            <ClientOnly>
              <SharedRichTextEditor v-model="form.description" placeholder="详细描述这个重要事件..." />
            </ClientOnly>
          </UFormGroup>
          <UFormGroup label="附件">
            <SharedMediaUploader v-model="form.mediaIds" multiple />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="resetForm">取消</UButton>
            <UButton :loading="saving" @click="saveMilestone">保存</UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Detail Slideover -->
    <USlideover v-model="showDetail" :ui="{ width: 'max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">大事记详情</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="sm" @click="showDetail = false" />
          </div>
        </template>
        <DetailMilestoneDetail v-if="selectedItem" :item="selectedItem" />
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const showForm = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const selectedCategory = ref('')
const selectedItem = ref<any>(null)
const showDetail = ref(false)

const { categories, categoryColor, categoryBadge, categoryLabel } = useMilestoneHelpers()

const form = reactive({
  title: '',
  description: '',
  eventDate: new Date().toISOString().slice(0, 10),
  category: 'other',
  importance: 3,
  mediaIds: [] as number[],
})

const { data, refresh } = await useFetch<{ items: any[] }>('/api/milestones')

const filteredItems = computed(() => {
  const items = data.value?.items || []
  if (!selectedCategory.value) return items
  return items.filter(m => m.category === selectedCategory.value)
})

function viewMilestone(milestone: any) {
  selectedItem.value = milestone
  showDetail.value = true
}

function editMilestone(m: any) {
  editingId.value = m.id
  form.title = m.title
  form.description = m.description || ''
  form.eventDate = m.eventDate
  form.category = m.category
  form.importance = m.importance
  form.mediaIds = m.media?.map((x: any) => x.id) || []
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.description = ''
  form.eventDate = new Date().toISOString().slice(0, 10)
  form.category = 'other'
  form.importance = 3
  form.mediaIds = []
  showForm.value = false
}

async function saveMilestone() {
  if (!form.title || !form.eventDate) {
    toast.add({ title: '请填写标题和日期', color: 'yellow' })
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/milestones/${editingId.value}`, { method: 'PUT', body: { ...form } })
      toast.add({ title: '大事记已更新', color: 'success' })
    } else {
      await $fetch('/api/milestones', { method: 'POST', body: { ...form } })
      toast.add({ title: '大事记已保存', color: 'success' })
    }
    resetForm()
    refresh()
  } catch {
    toast.add({ title: '保存失败', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function deleteMilestone(id: number) {
  if (!confirm('确定删除这条大事记？')) return
  try {
    await $fetch(`/api/milestones/${id}`, { method: 'DELETE' })
    toast.add({ title: '已删除', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: '删除失败', color: 'red' })
  }
}
</script>
