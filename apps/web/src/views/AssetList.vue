<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Layout from './Layout.vue'
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue'
import { materialBatchGet, materialDelete, materialAdd } from '@/services/wechat'
import { useDisplayStore, useStore } from '@/stores'
import { toast } from '@/utils/toast'

interface AssetItemVM {
  id: string
  name: string
  updatedAt: string
  url?: string
}

const loading = ref(false)
const error = ref('')
const items = ref<AssetItemVM[]>([])
const showUpload = ref(false)
const displayStore = useDisplayStore()

const store = useStore()

async function refresh() {
  try {
    loading.value = true
    error.value = ''
    const resp: any = await materialBatchGet({ type: 'image', offset: 0, count: 30 })
    const list: AssetItemVM[] = (resp?.item || []).map((it: any) => ({
      id: it.media_id,
      name: it.name || '未命名',
      updatedAt: it.update_time ? new Date(it.update_time * 1000).toLocaleString() : '',
      url: it.url, // 对于图片素材，微信可能返回 url；若无，则前端不预览
    }))
    items.value = list
  }
  catch (e: any) {
    error.value = e?.message || '加载素材失败'
  }
  finally {
    loading.value = false
  }
}

async function remove(it: AssetItemVM) {
  try {
    await materialDelete(it.id)
    toast.success('已删除素材')
    refresh()
  }
  catch (e: any) {
    toast.error(`删除失败：${e?.message || e}`)
  }
}

// 处理上传弹窗的上传事件：直接走“永久素材上传”接口
async function handleUpload(file: File, cleanup: (url: string, data: string) => void) {
  try {
    const resp: any = await materialAdd({ type: 'image', file })
    const url = resp?.url || ''
    cleanup(url, '')
    toast.success('上传成功')
    showUpload.value = false
    refresh()
  }
  catch (e: any) {
    toast.error(`上传失败：${e?.message || e}`)
  }
}

onMounted(refresh)
</script>

<template>
  <Layout>
    <section class="wrap">
      <div class="grid">
        <!-- 上传素材卡片 -->
        <div class="card upload" title="上传素材" @click="displayStore.toggleShowUploadImgDialog(true)">
          上传素材
        </div>
        <div v-if="loading" class="card loading">
          加载中…
        </div>
        <div v-else-if="error" class="card error">
          {{ error }}
        </div>
        <div v-for="it in items" :key="it.id" class="card">
          <div class="preview">
            <img v-if="it.url" :src="it.url" alt="素材预览">
            <div v-else class="noimg">无预览</div>
          </div>
          <div class="meta">
            <div class="title" :title="it.name">
              {{ it.name }}
            </div>
            <div class="time">更新时间：{{ it.updatedAt }}</div>
          </div>
          <button class="del" @click.stop="remove(it)">删除</button>
        </div>
      </div>
    </section>

    <UploadImgDialog @upload-image="handleUpload" />
  </Layout>
</template>

<style scoped>
.wrap { padding: 16px; }
.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}
.card {
  border: 1px solid #eee;
  border-radius: 8px;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #fff;
}
.card.upload {
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #666;
}
.card.loading, .card.error { display:flex; align-items:center; justify-content:center; color:#888; }
.preview { height: 140px; display:flex; align-items:center; justify-content:center; background:#fafafa; }
.preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.preview .noimg { color: #aaa; font-size: 12px; }
.meta { padding: 6px 8px; font-size: 12px; }
.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.time { color:#888; }
.del {
  position: absolute; right: 6px; bottom: 6px;
  border: 1px solid #eee; border-radius: 4px; padding: 2px 6px; background:#fff; cursor:pointer;
}

@media (max-width: 1280px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 960px)  { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 640px)  { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
