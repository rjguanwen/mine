<template>
  <div
    class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors"
    :class="{ 'border-blue-500 bg-blue-50': isDragging }"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileSelect"
    />

    <div v-if="uploads.length === 0" @click="fileInput?.click()" class="cursor-pointer">
      <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 text-gray-400 mx-auto" />
      <p class="mt-2 text-sm text-gray-600">点击或拖拽上传文件</p>
      <p class="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF, WebP, MP4, WebM</p>
    </div>

    <!-- Uploaded files preview -->
    <div v-if="uploads.length > 0" class="space-y-3">
      <div
        v-for="(upload, idx) in uploads"
        :key="idx"
        class="flex items-center gap-3 p-2 bg-gray-50 rounded"
      >
        <img
          v-if="upload.url && upload.mimeType?.startsWith('image/')"
          :src="upload.url"
          class="w-12 h-12 object-cover rounded"
        />
        <UIcon
          v-else-if="upload.mimeType?.startsWith('video/')"
          name="i-heroicons-video-camera"
          class="w-12 h-12 text-gray-400"
        />
        <div class="flex-1 text-left">
          <p class="text-sm font-medium text-gray-700 truncate">{{ upload.fileName }}</p>
          <p v-if="upload.uploading" class="text-xs text-blue-600">上传中...</p>
          <p v-else class="text-xs text-green-600">已上传</p>
        </div>
        <button @click="removeUpload(idx)" class="text-gray-400 hover:text-red-500">
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>
      <button
        @click="fileInput?.click()"
        class="text-sm text-blue-600 hover:underline"
      >
        继续添加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UploadedFile {
  id?: number
  url?: string
  fileName: string
  mimeType?: string
  uploading?: boolean
}

const props = defineProps<{
  modelValue?: number[]
  accept?: string
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  'uploaded': [file: { id: number; url: string }]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploads = ref<UploadedFile[]>([])

const accept = computed(() => props.accept || 'image/*,video/mp4,video/webm')

async function uploadFile(file: File) {
  const upload: UploadedFile = {
    fileName: file.name,
    mimeType: file.type,
    uploading: true,
  }
  uploads.value.push(upload)
  const idx = uploads.value.length - 1

  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await $fetch<{ id: number; url: string; fileName: string; mimeType: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })
    uploads.value[idx] = {
      id: result.id,
      url: result.url,
      fileName: result.fileName,
      mimeType: result.mimeType,
      uploading: false,
    }
    const ids = uploads.value.filter(u => u.id).map(u => u.id!) 
    emit('update:modelValue', ids)
    emit('uploaded', { id: result.id, url: result.url })
  } catch {
    uploads.value.splice(idx, 1)
  }
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of files) {
    uploadFile(file)
  }
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  for (const file of files) {
    uploadFile(file)
  }
}

function removeUpload(idx: number) {
  uploads.value.splice(idx, 1)
  const ids = uploads.value.filter(u => u.id).map(u => u.id!)
  emit('update:modelValue', ids)
}
</script>
