<template>
  <div class="rich-text-editor border border-gray-200 rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
      <button
        v-for="action in toolbarActions"
        :key="action.name"
        @click="action.command"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-blue-600': action.isActive?.() }"
        :title="action.title"
      >
        <UIcon :name="action.icon" class="w-4 h-4" />
      </button>
      <div class="w-px h-5 bg-gray-300 mx-1" />
      <button
        @click="triggerImageUpload"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors"
        title="插入图片"
      >
        <UIcon name="i-heroicons-photo" class="w-4 h-4" />
      </button>
    </div>

    <!-- Editor -->
    <div class="tiptap-editor">
      <EditorContent :editor="editor" />
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Image,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder || '开始写作...' }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '')
  }
})

const toolbarActions = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    { name: 'bold', icon: 'i-heroicons-bold', title: '粗体', command: () => e.chain().focus().toggleBold().run(), isActive: () => e.isActive('bold') },
    { name: 'italic', icon: 'i-heroicons-italic', title: '斜体', command: () => e.chain().focus().toggleItalic().run(), isActive: () => e.isActive('italic') },
    { name: 'h2', icon: 'i-heroicons-h2', title: '标题', command: () => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => e.isActive('heading', { level: 2 }) },
    { name: 'bulletList', icon: 'i-heroicons-list-bullet', title: '无序列表', command: () => e.chain().focus().toggleBulletList().run(), isActive: () => e.isActive('bulletList') },
    { name: 'orderedList', icon: 'i-heroicons-numbered-list', title: '有序列表', command: () => e.chain().focus().toggleOrderedList().run(), isActive: () => e.isActive('orderedList') },
    { name: 'blockquote', icon: 'i-heroicons-chat-bubble-bottom-center-text', title: '引用', command: () => e.chain().focus().toggleBlockquote().run(), isActive: () => e.isActive('blockquote') },
  ]
})

function triggerImageUpload() {
  fileInput.value?.click()
}

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })
    editor.value?.chain().focus().setImage({ src: result.url }).run()
  } catch {
    // Upload failed silently
  }

  if (fileInput.value) fileInput.value.value = ''
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>
