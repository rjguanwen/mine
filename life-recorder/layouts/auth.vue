<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Life Recorder</h1>
        <p class="text-gray-500 mt-2">记录人生，规划未来</p>
      </div>
      <UCard class="shadow-lg">
        <slot />
      </UCard>
    </div>
  </div>
</template>
