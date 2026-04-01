<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">日常记录</h1>
        <p class="text-gray-500 mt-1">记录你的每一天</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showForm = true">写日记</UButton>
    </div>

    <!-- Record List -->
    <div v-if="data?.items?.length" class="space-y-4">
      <UCard v-for="record in data.items" :key="record.id" class="hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1 cursor-pointer" @click="viewRecord(record)">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm text-gray-500">{{ record.recordDate }}</span>
              <span v-if="record.mood" class="text-sm">{{ moodEmoji(record.mood) }}</span>
              <span v-for="tag in record.tags" :key="tag.id"
                class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                {{ tag.name }}
              </span>
            </div>
            <h3 v-if="record.title" class="text-lg font-medium text-gray-900 mb-1">{{ record.title }}</h3>
            <div class="text-gray-600 text-sm line-clamp-3 prose prose-sm" v-html="record.content" />
            <!-- Media thumbnails -->
            <div v-if="record.media?.length" class="flex gap-2 mt-3">
              <img
                v-for="m in record.media.filter((x: any) => x.mimeType?.startsWith('image/'))"
                :key="m.id"
                :src="m.url"
                class="w-16 h-16 object-cover rounded"
              />
            </div>
          </div>
          <div class="flex gap-1 ml-4">
            <UButton variant="ghost" size="xs" icon="i-heroicons-pencil" @click="editRecord(record)" />
            <UButton variant="ghost" size="xs" icon="i-heroicons-trash" color="red" @click="deleteRecord(record.id)" />
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
      <UIcon name="i-heroicons-pencil-square" class="w-12 h-12 mx-auto mb-3" />
      <p>还没有日记，开始记录今天的生活吧</p>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="showForm">
      <UCard>
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-semibold">{{ editingId ? '编辑日记' : '写日记' }}</h2>
          <UFormGroup label="日期">
            <UInput v-model="form.recordDate" type="date" class="w-full" />
          </UFormGroup>
          <UFormGroup label="标题（可选）">
            <UInput v-model="form.title" placeholder="给今天起个标题..." class="w-full" />
          </UFormGroup>
          <UFormGroup label="内容">
            <ClientOnly>
              <SharedRichTextEditor v-model="form.content" placeholder="记录今天的所见所闻..." />
            </ClientOnly>
          </UFormGroup>
          <UFormGroup label="心情">
            <SharedMoodPicker v-model="form.mood" />
          </UFormGroup>
          <UFormGroup label="标签">
            <SharedTagInput v-model="form.tagIds" />
          </UFormGroup>
          <UFormGroup label="附件">
            <SharedMediaUploader v-model="form.mediaIds" multiple />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="resetForm">取消</UButton>
            <UButton :loading="saving" @click="saveRecord">保存</UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Detail Slideover -->
    <USlideover v-model="showDetail" :ui="{ width: 'max-w-md' }">
      <UCard :ui="{ body: { padding: 'p-4 sm:p-6 overflow-y-auto' }, ring: '', shadow: '' }" class="flex flex-col flex-1 min-h-0 max-h-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">日记详情</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="sm" @click="showDetail = false" />
          </div>
        </template>
        <DetailRecordDetail v-if="selectedItem" :item="selectedItem" />
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const showForm = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const selectedItem = ref<any>(null)
const showDetail = ref(false)

const { moodEmoji } = useMoodMap()

const form = reactive({
  title: '',
  content: '',
  recordDate: new Date().toISOString().slice(0, 10),
  mood: null as string | null,
  tagIds: [] as number[],
  mediaIds: [] as number[],
})

const { data, refresh } = await useFetch<{ items: any[] }>('/api/records')

function viewRecord(record: any) {
  selectedItem.value = record
  showDetail.value = true
}

function editRecord(record: any) {
  editingId.value = record.id
  form.title = record.title || ''
  form.content = record.content || ''
  form.recordDate = record.recordDate
  form.mood = record.mood
  form.tagIds = record.tags?.map((t: any) => t.id) || []
  form.mediaIds = record.media?.map((m: any) => m.id) || []
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.recordDate = new Date().toISOString().slice(0, 10)
  form.mood = null
  form.tagIds = []
  form.mediaIds = []
  showForm.value = false
}

async function saveRecord() {
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/records/${editingId.value}`, { method: 'PUT', body: { ...form } })
      toast.add({ title: '日记已更新', color: 'green' })
    } else {
      await $fetch('/api/records', { method: 'POST', body: { ...form } })
      toast.add({ title: '日记已保存', color: 'green' })
    }
    resetForm()
    refresh()
  } catch {
    toast.add({ title: '保存失败', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function deleteRecord(id: number) {
  if (!confirm('确定删除这条日记？')) return
  try {
    await $fetch(`/api/records/${id}`, { method: 'DELETE' })
    toast.add({ title: '已删除', color: 'green' })
    refresh()
  } catch {
    toast.add({ title: '删除失败', color: 'red' })
  }
}
</script>
