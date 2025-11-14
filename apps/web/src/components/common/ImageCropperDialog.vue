<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ensureJcropLoaded } from '@/utils/jcrop-loader'

const props = defineProps<{ open: boolean, src: string, ratio?: number }>()
const emit = defineEmits(['update:open', 'confirm'])

const visible = ref(false)
watch(() => props.open, v => (visible.value = v))
watch(visible, v => emit('update:open', v))

const imgRef = ref<HTMLImageElement | null>(null)
let jcropApi: any = null
let naturalW = 0
let naturalH = 0
const normalized = ref<{ x1: number, y1: number, x2: number, y2: number } | null>(null)

async function initCrop() {
  if (!imgRef.value) return
  await ensureJcropLoaded()
  const img = imgRef.value
  // 等图片尺寸可用
  await new Promise<void>((resolve) => {
    if (img.complete) return resolve()
    img.onload = () => resolve()
    img.onerror = () => resolve()
  })
  naturalW = img.naturalWidth || img.width
  naturalH = img.naturalHeight || img.height
  const ratio = props.ratio ?? 2.35
  // 计算固定选区尺寸：优先全宽，否则全高
  let selW = naturalW
  let selH = Math.round(selW / ratio)
  let x = 0
  let y = Math.max(0, Math.round((naturalH - selH) / 2))
  if (selH > naturalH) {
    selH = naturalH
    selW = Math.round(selH * ratio)
    x = Math.max(0, Math.round((naturalW - selW) / 2))
    y = 0
  }
  const $: any = (window as any).jQuery
  if (jcropApi) { try { jcropApi.destroy() } catch {} jcropApi = null }
  const handle = (c: any) => {
    normalized.value = {
      x1: c.x / naturalW, y1: c.y / naturalH, x2: (c.x + c.w) / naturalW, y2: (c.y + c.h) / naturalH,
    }
  }
  // 固定选区大小：minSize==maxSize；允许拖动改变位置
  ;($(img) as any).Jcrop({
    aspectRatio: ratio,
    trueSize: [naturalW, naturalH],
    setSelect: [x, y, x + selW, y + selH],
    minSize: [selW, selH],
    maxSize: [selW, selH],
    allowResize: false,
    onChange: handle,
    onSelect: handle,
  }, function ready() { jcropApi = this; handle({ x, y, w: selW, h: selH }) })
}

watch(() => props.src, async () => {
  await nextTick(); await initCrop()
})
onMounted(async () => { await nextTick(); await initCrop() })

function onConfirm() {
  if (!normalized.value) return
  emit('confirm', normalized.value)
  visible.value = false
}
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="max-w-[860px] w-[90vw] overflow-hidden">
      <DialogHeader>
        <DialogTitle>裁剪封面（2.35:1）</DialogTitle>
      </DialogHeader>
      <div class="w-full">
        <img ref="imgRef" :src="props.src" alt="封面裁剪" class="block w-full h-auto" />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="visible = false">取消</Button>
        <Button @click="onConfirm">确定</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>

