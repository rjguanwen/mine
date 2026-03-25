export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()

  // Allow access to public pages
  if (to.path === '/login' || to.path === '/register') {
    // If already authenticated, redirect to dashboard
    if (!user.value) {
      await fetchUser()
    }
    if (user.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // For all other pages, require authentication
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }

  // If not setup complete and not on setup page, redirect to setup
  if (!user.value.isSetupComplete && to.path !== '/setup') {
    return navigateTo('/setup')
  }

  // If setup complete and on setup page, redirect to dashboard
  if (user.value.isSetupComplete && to.path === '/setup') {
    return navigateTo('/dashboard')
  }
})
