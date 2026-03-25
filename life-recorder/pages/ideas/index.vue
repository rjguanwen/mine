<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">想法灵感</h1>
        <p class="text-gray-500 mt-1">捕捉每一个灵光一闪</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showForm = true">记录灵感</UButton>
    </div>

    <!-- Ideas Grid (Masonry-like) -->
    <div v-if="data?.items?.length" class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      <UCard
        v-for="idea in data.items"
        :key="idea.id"
        class="break-inside-avoid hover:shadow-md transition-shadow"
      >
        <div class="space-y-2">
          <div class="flex items-start justify-between">
            <h3 v-if="idea.title" class="font-medium text-gray-900">{{ idea.title }}</h3>
            <div class="flex gap-1">
              <UButton variant="ghost" size="xs" icon="i-heroicons-pencil" @click="editIdea(idea)" />
              <UButton variant="ghost" size="xs" icon="i-heroicons-trash" color="red" @click="deleteIdea(idea.id)" />
            </div>
          </div>

          <div v-if="idea.content" class="text-sm text-gray-600 prose prose-sm" v-html="idea.content" />

          <!-- Media -->
          <div v-if="idea.media?.length" class="flex gap-2 flex-wrap">
            <template v-for="m in idea.media" :key="m.id">
              <img
                v-if="m.mimeType?.startsWith('image/')"
                :src="m.url"
                class="w-full rounded object-cover max-h-48"
              />
              <video
                v-else-if="m.mimeType?.startsWith('video/')"
                :src="m.url"
                controls
                class="w-full rounded max-h-48"
              />
            </template>
          </div>

          <!-- Tags -->
          <div v-if="idea.tags?.length" class="flex gap-1 flex-wrap">
            <span v-for="tag in idea.tags" :key="tag.id"
              class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {{ tag.name }}
            </span>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>{{ idea.createdAt?.slice(0, 10) }}</span>
            <span v-if="idea.linkedPlanId" class="text-purple-500">
              <UIcon name="i-heroicons-link" class="w-3 h-3 inline" /> 已关联规划
            </span>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
      <UIcon name="i-heroicons-light-bulb" class="w-12 h-12 mx-auto mb-3" />
      <p>还没有记录灵感，把脑海中的想法写下来吧</p>
    </div>

    <!-- Form Modal -->
    <UModal v-model="showForm">
      <UCard>
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-semibold">{{ editingId ? '编辑灵感' : '记录灵感' }}</h2>
          <UFormGroup label="标题（可选）">
            <UInput v-model="form.title" placeholder="给灵感起个名字..." class="w-full" />
          </UFormGroup>
          <UFormGroup label="内容">
            <ClientOnly>
              <SharedRichTextEditor v-model="form.content" placeholder="记录你的想法..." />
            </ClientOnly>
          </UFormGroup>
          <UFormGroup label="附件">
            <SharedMediaUploader v-model="form.mediaIds" multiple />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="resetForm">取消</UButton>
            <UButton :loading="saving" @click="saveIdea">保存</UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const showForm = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  title: '',
  content: '',
  mediaIds: [] as number[],
})

const { data, refresh } = await useFetch<{ items: any[] }>('/api/ideas')

function editIdea(idea: any) {
  editingId.value = idea.id
  form.title = idea.title || ''
  form.content = idea.content || ''
  form.mediaIds = idea.media?.map((m: any) => m.id) || []
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.mediaIds = []
  showForm.value = false
}

async function saveIdea() {
  if (!form.title && !form.content) {
    toast.add({ title: '请输入标题或内容', color: 'yellow' })
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/ideas/${editingId.value}`, { method: 'PUT', body: { ...form } })
      toast.add({ title: '灵感已更新', color: 'success' })
    } else {
      await $fetch('/api/ideas', { method: 'POST', body: { ...form } })
      toast.add({ title: '灵感已记录', color: 'success' })
    }
    resetForm()
    refresh()
  } catch {
    toast.add({ title: '保存失败', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function deleteIdea(id: number) {
  if (!confirm('确定删除这条灵感？')) return
  try {
    await $fetch(`/api/ideas/${id}`, { method: 'DELETE' })
    toast.add({ title: '已删除', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: '删除失败', color: 'red' })
  }
}
</script>
