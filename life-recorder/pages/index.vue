<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { user, fetchUser } = useAuth()

onMounted(async () => {
  if (!user.value) {
    await fetchUser()
  }
  if (user.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>
