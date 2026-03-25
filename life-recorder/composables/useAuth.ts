interface User {
  id: number
  email: string
  displayName: string
  birthDate: string | null
  expectedLifespan: number
  avatarUrl: string | null
  isSetupComplete: boolean
}

const user = ref<User | null>(null)
const isAuthenticated = computed(() => !!user.value)
const isLoading = ref(false)

export function useAuth() {
  async function fetchUser() {
    try {
      isLoading.value = true
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
      return data
    } catch {
      user.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
    return data
  }

  async function register(email: string, password: string, displayName: string) {
    const data = await $fetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
    })
    user.value = data.user
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  async function updateProfile(data: Partial<Pick<User, 'displayName' | 'birthDate' | 'expectedLifespan'>>) {
    const result = await $fetch<User>('/api/profile', {
      method: 'PUT',
      body: data,
    })
    user.value = result
    return result
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    fetchUser,
    login,
    register,
    logout,
    updateProfile,
  }
}
