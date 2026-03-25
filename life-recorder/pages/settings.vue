<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">设置</h1>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900">个人信息</h2>
      </template>
      <form @submit.prevent="handleSave" class="space-y-4">
        <UFormGroup label="昵称">
          <UInput v-model="form.displayName" size="lg" class="w-full" />
        </UFormGroup>
        <UFormGroup label="出生日期">
          <UInput v-model="form.birthDate" type="date" size="lg" class="w-full" />
        </UFormGroup>
        <UFormGroup label="预期寿命">
          <div class="flex items-center gap-4">
            <input v-model.number="form.expectedLifespan" type="range" min="50" max="120" class="flex-1" />
            <span class="text-lg font-semibold text-gray-700 w-12 text-center">{{ form.expectedLifespan }}</span>
          </div>
        </UFormGroup>
        <div class="flex justify-end">
          <UButton type="submit" :loading="saving">保存设置</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { user, updateProfile } = useAuth()
const toast = useToast()
const saving = ref(false)

const form = reactive({
  displayName: user.value?.displayName || '',
  birthDate: user.value?.birthDate || '',
  expectedLifespan: user.value?.expectedLifespan || 80,
})

watch(user, (u) => {
  if (u) {
    form.displayName = u.displayName
    form.birthDate = u.birthDate || ''
    form.expectedLifespan = u.expectedLifespan || 80
  }
}, { immediate: true })

async function handleSave() {
  saving.value = true
  try {
    await updateProfile({
      displayName: form.displayName,
      birthDate: form.birthDate,
      expectedLifespan: form.expectedLifespan,
    })
    toast.add({ title: '设置已保存', color: 'green' })
  } catch {
    toast.add({ title: '保存失败', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
