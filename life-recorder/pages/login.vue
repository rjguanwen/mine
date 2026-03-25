<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">登录</h2>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <UFormGroup label="邮箱">
        <UInput
          v-model="email"
          type="email"
          placeholder="请输入邮箱"
          size="lg"
          class="w-full"
          required
        />
      </UFormGroup>
      <UFormGroup label="密码">
        <UInput
          v-model="password"
          type="password"
          placeholder="请输入密码"
          size="lg"
          class="w-full"
          required
        />
      </UFormGroup>
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
      >
        登录
      </UButton>
    </form>
    <p class="mt-4 text-center text-sm text-gray-500">
      还没有账号？
      <NuxtLink to="/register" class="text-blue-600 hover:underline">注册</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const result = await login(email.value, password.value)
    if (result.user.isSetupComplete) {
      navigateTo('/dashboard')
    } else {
      navigateTo('/setup')
    }
  } catch (e: any) {
    error.value = e.data?.statusMessage || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
