<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { freePublishGetArticle } from '@/services/wechat'
import Layout from './Layout.vue'

const { id } = useRoute().params as { id: string }
const loading = ref(false)
const error = ref(``)
const title = ref(``)
const html = ref(``)

async function load() {
  try {
    loading.value = true
    error.value = ``
    const resp: any = await freePublishGetArticle(id)
    const first = resp?.news_item?.[0] || resp?.content?.news_item?.[0] || {}
    title.value = first.title || `文章详情`
    html.value = first.content || ``
  }
  catch (e: any) {
    error.value = e?.message || `加载详情失败`
  }
  finally { loading.value = false }
}

onMounted(load)
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
      <div v-else>
        <h2>{{ title }}</h2>
        <div v-html="html" />
      </div>
    </section>
  </Layout>
</template>
