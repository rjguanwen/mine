<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">未来规划</h1>
        <p class="text-gray-500 mt-1">规划人生，追踪进度</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showForm = true">新建规划</UButton>
    </div>

    <!-- Kanban Board -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="column in columns"
        :key="column.status"
        class="bg-gray-50 rounded-xl p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-700 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="column.color" />
            {{ column.label }}
          </h3>
          <span class="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {{ getColumnPlans(column.status).length }}
          </span>
        </div>

        <div class="space-y-3 min-h-[100px]">
          <UCard
            v-for="plan in getColumnPlans(column.status)"
            :key="plan.id"
            class="cursor-pointer hover:shadow-md transition-shadow"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="priorityBadge(plan.priority)">
                  {{ priorityLabel(plan.priority) }}
                </span>
                <UDropdown :items="getPlanActions(plan)" :popper="{ placement: 'bottom-end' }">
                  <UButton variant="ghost" size="xs" icon="i-heroicons-ellipsis-horizontal" />
                </UDropdown>
              </div>
              <h4 class="font-medium text-gray-900 text-sm">{{ plan.title }}</h4>
              <div v-if="plan.description" class="text-xs text-gray-500 line-clamp-2" v-html="plan.description" />
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span v-if="plan.targetDate">
                  <UIcon name="i-heroicons-calendar" class="w-3 h-3 inline" />
                  {{ plan.targetDate }}
                </span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <UModal v-model="showForm">
      <UCard>
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-semibold">{{ editingId ? '编辑规划' : '新建规划' }}</h2>
          <UFormGroup label="标题" required>
            <UInput v-model="form.title" placeholder="目标名称" class="w-full" />
          </UFormGroup>
          <UFormGroup label="描述">
            <ClientOnly>
              <SharedRichTextEditor v-model="form.description" placeholder="详细描述你的目标..." />
            </ClientOnly>
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="开始日期">
              <UInput v-model="form.startDate" type="date" class="w-full" />
            </UFormGroup>
            <UFormGroup label="目标日期">
              <UInput v-model="form.targetDate" type="date" class="w-full" />
            </UFormGroup>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="优先级">
              <USelect v-model="form.priority" :options="priorities" value-attribute="value" option-attribute="label" class="w-full" />
            </UFormGroup>
            <UFormGroup label="状态">
              <USelect v-model="form.status" :options="statusOptions" value-attribute="value" option-attribute="label" class="w-full" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="resetForm">取消</UButton>
            <UButton :loading="saving" @click="savePlan">保存</UButton>
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

const columns = [
  { status: 'not_started', label: '未开始', color: 'bg-gray-400' },
  { status: 'in_progress', label: '进行中', color: 'bg-blue-500' },
  { status: 'completed', label: '已完成', color: 'bg-green-500' },
  { status: 'abandoned', label: '已放弃', color: 'bg-red-400' },
]

const priorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

const statusOptions = [
  { value: 'not_started', label: '未开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'abandoned', label: '已放弃' },
]

const form = reactive({
  title: '',
  description: '',
  startDate: '',
  targetDate: '',
  priority: 'medium',
  status: 'not_started',
})

const { data, refresh } = await useFetch<{ items: any[] }>('/api/plans')

function getColumnPlans(status: string) {
  return (data.value?.items || []).filter(p => p.status === status)
}

function priorityBadge(p: string) {
  const map: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600',
  }
  return map[p] || 'bg-gray-100 text-gray-600'
}

function priorityLabel(p: string) {
  return priorities.find(x => x.value === p)?.label || p
}

function getPlanActions(plan: any) {
  return [[
    { label: '编辑', icon: 'i-heroicons-pencil', click: () => editPlan(plan) },
    ...columns.filter(c => c.status !== plan.status).map(c => ({
      label: `移至${c.label}`,
      click: () => updateStatus(plan.id, c.status),
    })),
    { label: '删除', icon: 'i-heroicons-trash', color: 'red' as const, click: () => deletePlan(plan.id) },
  ]]
}

function editPlan(plan: any) {
  editingId.value = plan.id
  form.title = plan.title
  form.description = plan.description || ''
  form.startDate = plan.startDate || ''
  form.targetDate = plan.targetDate || ''
  form.priority = plan.priority
  form.status = plan.status
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.description = ''
  form.startDate = ''
  form.targetDate = ''
  form.priority = 'medium'
  form.status = 'not_started'
  showForm.value = false
}

async function savePlan() {
  if (!form.title) {
    toast.add({ title: '请填写标题', color: 'yellow' })
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/plans/${editingId.value}`, { method: 'PUT', body: { ...form } })
      toast.add({ title: '规划已更新', color: 'success' })
    } else {
      await $fetch('/api/plans', { method: 'POST', body: { ...form } })
      toast.add({ title: '规划已创建', color: 'success' })
    }
    resetForm()
    refresh()
  } catch {
    toast.add({ title: '保存失败', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function updateStatus(id: number, status: string) {
  try {
    await $fetch(`/api/plans/${id}`, { method: 'PUT', body: { status } })
    refresh()
  } catch {
    toast.add({ title: '更新失败', color: 'red' })
  }
}

async function deletePlan(id: number) {
  if (!confirm('确定删除这条规划？')) return
  try {
    await $fetch(`/api/plans/${id}`, { method: 'DELETE' })
    toast.add({ title: '已删除', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: '删除失败', color: 'red' })
  }
}
</script>
