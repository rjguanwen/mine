<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30 transition-transform duration-300"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <h1 class="text-lg font-bold text-gray-900">Life Recorder</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path)
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User section -->
      <div class="p-4 border-t border-gray-100">
        <NuxtLink
          to="/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
          <span>设置</span>
        </NuxtLink>
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors mt-1"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/20 z-20 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 lg:ml-64">
      <!-- Top header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden mr-4"
        >
          <UIcon name="i-heroicons-bars-3" class="w-6 h-6 text-gray-600" />
        </button>
        <div class="flex-1" />
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ user?.displayName }}</span>
          <UAvatar
            :alt="user?.displayName || ''"
            size="sm"
          />
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { path: '/dashboard', label: '概览', icon: 'i-heroicons-home' },
  { path: '/calendar', label: '人生日历', icon: 'i-heroicons-calendar-days' },
  { path: '/milestones', label: '大事记', icon: 'i-heroicons-trophy' },
  { path: '/records', label: '日常记录', icon: 'i-heroicons-pencil-square' },
  { path: '/plans', label: '未来规划', icon: 'i-heroicons-flag' },
  { path: '/ideas', label: '想法灵感', icon: 'i-heroicons-light-bulb' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
