<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ensureEditingDraft } from '@/services/draftRepo'
import CodemirrorEditor from './CodemirrorEditor.vue'
import Layout from './Layout.vue'

const route = useRoute()
const router = useRouter()
const draftParam = route.params.id as string | undefined
// 确保存在可编辑草稿，并切换为当前
const ensuredId = ensureEditingDraft(draftParam)
// 若传入的 id 并非本地草稿 id，则在新建后用新 id 替换 URL，保持地址的一致性
if (draftParam && ensuredId !== draftParam) {
  router.replace({ name: `draftEdit`, params: { id: ensuredId } })
}
</script>

<template>
  <Layout>
    <CodemirrorEditor />
  </Layout>
</template>
