<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">欢迎使用 Life Recorder</h1>
        <p class="text-gray-500 mt-2">请先设置您的基本信息，开始记录人生旅程</p>
      </div>
      <UCard class="shadow-lg">
        <form @submit.prevent="handleSetup" class="space-y-6">
          <UFormGroup label="出生日期" required>
            <UInput
              v-model="birthDate"
              type="date"
              size="lg"
              class="w-full"
              required
            />
          </UFormGroup>

          <UFormGroup label="预期寿命（年）">
            <div class="flex items-center gap-4">
              <input
                v-model.number="expectedLifespan"
                type="range"
                min="50"
                max="120"
                class="flex-1"
              />
              <span class="text-lg font-semibold text-gray-700 w-12 text-center">
                {{ expectedLifespan }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-1">用于生成您的人生日历</p>
          </UFormGroup>

          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            开始我的人生记录
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { updateProfile } = useAuth()
const birthDate = ref('')
const expectedLifespan = ref(80)
const error = ref('')
const loading = ref(false)

async function handleSetup() {
  if (!birthDate.value) {
    error.value = '请选择出生日期'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await updateProfile({
      birthDate: birthDate.value,
      expectedLifespan: expectedLifespan.value,
    })
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '设置失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
