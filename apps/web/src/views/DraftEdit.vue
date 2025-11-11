<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ensureEditingDraft } from '@/services/draftRepo'
import CodemirrorEditor from './CodemirrorEditor.vue'
import Layout from './Layout.vue'

const route = useRoute()
const draftParam = route.params.id as string | undefined
// 确保存在可编辑草稿，并切换为当前
ensureEditingDraft(draftParam)
</script>

<template>
  <Layout>
    <CodemirrorEditor />
  </Layout>
</template>
