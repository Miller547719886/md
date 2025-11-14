<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useStore } from '@/stores'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { draftUpdate, materialAdd, uploadContentImage } from '@/services/wechat'
import { publishCurrentDraft } from '@/services/publish'
import { toast } from '@/utils/toast'
import ImageCropperDialog from '@/components/common/ImageCropperDialog.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits([`update:open`, `published`])

const visible = computed({
  get: () => props.open,
  set: v => emit('update:open', v),
})

const file = ref<File | null>(null)
const previewUrl = ref<string>('')
const uploading = ref(false)
const publishing = ref(false)
const store = useStore()
const cropperOpen = ref(false)
const coverCrop = ref<{ x1: number, y1: number, x2: number, y2: number } | null>(null)

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (f) {
    file.value = f
    previewUrl.value = URL.createObjectURL(f)
    coverCrop.value = null
    cropperOpen.value = true
  }
}

async function onConfirm() {
  if (!file.value) {
    toast.error('请先选择封面图片')
    return
  }
  try {
    // 在发布前确保内容已格式化并渲染，避免旧输出
    await store.formatContent()
    store.editorRefresh()
    // 收集正文图片并转换为微信永久素材 URL 与 media_id
    const div = document.createElement('div')
    div.innerHTML = store.output
    const imgs = Array.from(div.querySelectorAll('img'))
    let urlMap: Record<string, string> = {}
    try {
      const raw = localStorage.getItem('mpImageMediaMap')
      urlMap = raw ? JSON.parse(raw) : {}
    } catch {}
    const imageMediaIds: string[] = []
    for (const img of imgs) {
      const src = img.getAttribute('src') || ''
      if (!src || /mmbiz\.qpic\.cn|mmbiz\.qlogo\.cn/.test(src)) continue
      try {
        if (urlMap[src]) {
          imageMediaIds.push(urlMap[src])
          continue
        }
        const r = await fetch(src)
        const b = await r.blob()
        const f = new File([b], 'image.jpg', { type: b.type || 'image/jpeg' })
        const { url, media_id } = await uploadContentImage(f) as any
        if (url) img.setAttribute('src', url)
        if (media_id) imageMediaIds.push(media_id)
        try { urlMap[url] = media_id; localStorage.setItem('mpImageMediaMap', JSON.stringify(urlMap)) } catch {}
      } catch (e) {
        console.warn('上传内容图片失败', e)
      }
    }
    const finalHtml = div.innerHTML
    uploading.value = true
    // 上传为永久素材（thumb），用于图文封面
    const resp: any = await materialAdd({ type: 'thumb', file: file.value })
    const mediaId = resp?.media_id
    if (!mediaId)
      throw new Error('未获取到封面 media_id')

    uploading.value = false
    publishing.value = true
    // 若当前草稿已保存过（有 wxMediaId），先以相同内容补写 image_info/cover_info 再发布，避免重复新增
    const current: any = store.getPostById(store.currentPostId)
    if (current?.wxMediaId) {
      const temp = document.createElement('div')
      temp.innerHTML = finalHtml
      const heading = temp.querySelector('h1, h2, h3, h4, h5, h6')
      const para = temp.querySelector('p')
      const article = {
        article_type: 'newspic',
        title: heading?.textContent?.trim() || '未命名标题',
        author: '',
        digest: para?.textContent?.trim() || '',
        content: finalHtml,
        image_info: { image_list: [{ image_media_id: mediaId }, ...imageMediaIds.slice(0, 19).map(id => ({ image_media_id: id }))] },
        cover_info: coverCrop.value ? {
          crop_percent_list: [
            { ratio: '2.35_1', x1: String(coverCrop.value.x1), y1: String(coverCrop.value.y1), x2: String(coverCrop.value.x2), y2: String(coverCrop.value.y2) },
          ],
        } : undefined,
      }
      await draftUpdate({ media_id: current.wxMediaId, index: 0, articles: article })
      const pub = await publishCurrentDraft({ reuseMediaId: current.wxMediaId })
      publishing.value = false
      toast.success('发布任务已提交')
      emit('published', pub)
      visible.value = false
      return
    }

    // 否则走新增草稿并发布路径（传入封面与裁剪信息）
    const pub = await publishCurrentDraft({ coverMediaId: mediaId, coverCrop: coverCrop.value || undefined })
    publishing.value = false
    toast.success('发布任务已提交')
    emit('published', pub)
    visible.value = false
  }
  catch (e: any) {
    uploading.value = false
    publishing.value = false
    toast.error(`发布失败：${e?.message || e}`)
  }
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="max-w-[520px] w-[520px] overflow-x-hidden">
      <DialogHeader>
        <DialogTitle>发布设置</DialogTitle>
      </DialogHeader>

      <div class="space-y-3">
        <div class="text-sm text-muted-foreground">
          请上传本次发布的封面图片（必填）。
        </div>

        <div class="flex items-start gap-3 min-w-0">
          <div class="w-[160px] h-[120px] bg-muted flex items-center justify-center overflow-hidden rounded border">
            <img v-if="previewUrl" :src="previewUrl" alt="预览" class="max-w-full h-auto">
            <span v-else class="text-xs text-muted-foreground">无预览</span>
          </div>
          <div class="flex-1 min-w-0">
            <input type="file" accept="image/*" class="block w-full max-w-full" style="max-width:100%" @change="onFile">
            <p class="mt-2 text-xs text-muted-foreground">建议尺寸：可用 900x383（2.35:1）或 900x900（1:1），大小≤2MB。</p>
          </div>
        </div>

        <div v-if="uploading || publishing" class="text-sm text-muted-foreground">
          <span v-if="uploading">正在上传封面…</span>
          <span v-else-if="publishing">正在提交发布…</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="uploading || publishing" @click="onCancel">取消</Button>
        <Button :disabled="uploading || publishing" @click="onConfirm">确定发布</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <ImageCropperDialog v-model:open="cropperOpen" :src="previewUrl" :ratio="2.35" @confirm="(c:any)=>{ coverCrop = c }" />
  
</template>

<style scoped>
</style>
