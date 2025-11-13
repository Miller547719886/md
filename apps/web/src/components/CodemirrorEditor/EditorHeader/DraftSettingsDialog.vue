<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/stores'
import { draftAdd, draftUpdate } from '@/services/wechat'
import { uploadContentImage } from '@/services/wechat'
import { toast } from '@/utils/toast'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits([`update:open`, `saved`])

const visible = computed({ get: () => props.open, set: v => emit('update:open', v) })
const mode = ref<'content-first' | 'upload'>('content-first')
const file = ref<File | null>(null)
const previewUrl = ref<string>('')
const working = ref(false)
const store = useStore()

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (f) {
    file.value = f
    previewUrl.value = URL.createObjectURL(f)
  }
}

async function ensureCoverMediaId(): Promise<string> {
  if (mode.value === 'upload') {
    if (!file.value) throw new Error('请上传封面图片')
    const { media_id } = await uploadContentImage(file.value) as any
    if (!media_id) throw new Error('未获取到封面 media_id')
    return media_id
  }
  // content-first 模式：取正文首图并转为永久素材
  const div = document.createElement('div')
  div.innerHTML = store.output
  const img = div.querySelector('img') as HTMLImageElement | null
  if (!img) throw new Error('未在正文中找到图片，请改为上传封面')
  const src = img.getAttribute('src') || ''
  // 先尝试从本地映射获取 media_id，避免重复上传
  try {
    const raw = localStorage.getItem('mpImageMediaMap')
    const map = raw ? JSON.parse(raw) : {}
    const mapped = map[src]
    if (mapped) return mapped
  } catch {}
  const resp = await fetch(src)
  const blob = await resp.blob()
  const f = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })
  const { media_id } = await uploadContentImage(f) as any
  if (!media_id) throw new Error('首图上传失败，未获取到 media_id')
  return media_id
}

async function onConfirm() {
  try {
    working.value = true
    await store.formatContent()
    store.editorRefresh()
    const coverMediaId = await ensureCoverMediaId()

    // 组装 newspic 草稿，至少包含首张 image_media_id
    const div = document.createElement('div')
    div.innerHTML = store.output
    const heading = div.querySelector('h1, h2, h3, h4, h5, h6')
    const para = div.querySelector('p')
    const article: any = {
      article_type: 'newspic',
      title: heading?.textContent?.trim() || '未命名标题',
      author: '',
      digest: para?.textContent?.trim() || '',
      content: store.output,
      image_info: { image_list: [{ image_media_id: coverMediaId }] },
    }

    const current = store.getPostById(store.currentPostId) as any
    if (current?.wxMediaId) {
      await draftUpdate({ media_id: current.wxMediaId, index: 0, articles: article })
      toast.success('草稿已更新')
    }
    else {
      const resp: any = await draftAdd({ articles: [article] })
      const mediaId = resp?.media_id
      if (mediaId && current) current.wxMediaId = mediaId
      toast.success('草稿已保存')
    }

    emit('saved')
    visible.value = false
  }
  catch (e: any) {
    toast.error(`保存失败：${e?.message || e}`)
  }
  finally {
    working.value = false
  }
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="max-w-[520px]">
      <DialogHeader>
        <DialogTitle>草稿设置</DialogTitle>
      </DialogHeader>

      <div class="space-y-3">
        <div class="text-sm text-muted-foreground">请选择封面来源（首张图片将作为封面图）。</div>

        <div class="flex items-center gap-3">
          <label class="text-sm">
            <input v-model="mode" type="radio" value="content-first" class="mr-2">
            使用正文首张图片
          </label>
          <label class="text-sm">
            <input v-model="mode" type="radio" value="upload" class="mr-2">
            上传封面
          </label>
        </div>

        <div v-if="mode==='upload'" class="flex items-start gap-3">
          <div class="w-[160px] h-[120px] bg-muted flex items-center justify-center overflow-hidden rounded border">
            <img v-if="previewUrl" :src="previewUrl" alt="预览" class="object-cover w-full h-full">
            <span v-else class="text-xs text-muted-foreground">无预览</span>
          </div>
          <div class="flex-1">
            <input type="file" accept="image/*" @change="onFile">
            <p class="mt-2 text-xs text-muted-foreground">将上传为永久素材，大小≤2MB。</p>
          </div>
        </div>

        <div v-if="working" class="text-sm text-muted-foreground">处理中…</div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="working" @click="onCancel">取消</Button>
        <Button :disabled="working" @click="onConfirm">确定</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
