<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">注册</h2>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <UFormGroup label="昵称">
        <UInput
          v-model="displayName"
          placeholder="请输入昵称"
          size="lg"
          class="w-full"
          required
        />
      </UFormGroup>
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
          placeholder="至少8位字符"
          size="lg"
          class="w-full"
          required
        />
      </UFormGroup>
      <UFormGroup label="确认密码">
        <UInput
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
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
        注册
      </UButton>
    </form>
    <p class="mt-4 text-center text-sm text-gray-500">
      已有账号？
      <NuxtLink to="/login" class="text-blue-600 hover:underline">登录</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (password.value.length < 8) {
    error.value = '密码至少需要8位字符'
    return
  }

  loading.value = true
  try {
    await register(email.value, password.value, displayName.value)
    navigateTo('/setup')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
