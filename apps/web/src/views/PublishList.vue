<script setup lang="ts">
import type { PublishItemVM } from '@/services/mappers'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mapPublishBatchGet } from '@/services/mappers'
import { freePublishBatchGet } from '@/services/wechat'
import { toast } from '@/utils/toast'
import Layout from './Layout.vue'

const loading = ref(false)
const error = ref(``)
const items = ref<PublishItemVM[]>([])
const router = useRouter()

async function refresh() {
  try {
    loading.value = true
    error.value = ``
    const resp = await freePublishBatchGet({ offset: 0, count: 20 })
    items.value = mapPublishBatchGet(resp)
  }
  catch (e: any) {
    error.value = e?.message || `加载发布列表失败`
    toast.error(error.value)
  }
  finally { loading.value = false }
}

function open(id: string) {
  // 使用路由跳转以适配子路径 base
  router.push({ name: `publishDetail`, params: { id } })
}

onMounted(refresh)
</script>

<template>
  <Layout>
    <section style="padding:16px">
      <div v-if="loading">
        加载中…
      </div>
      <div v-else-if="error" style="color:#a00">
        {{ error }}
      </div>
      <ul v-else>
        <li v-for="p in items" :key="p.id">
          <a href="#" @click.prevent="open(p.id)">{{ p.title }}</a>
          <small style="color:#888">（发布时间：{{ p.publishedAt }}）</small>
        </li>
      </ul>
    </section>
  </Layout>
</template>
