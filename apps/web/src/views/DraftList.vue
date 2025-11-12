<script setup lang="ts">
import type { DraftCard as LocalDraft } from '@/services/draftRepo'
import type { DraftCardVM } from '@/services/mappers'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createDraft, deleteDraft, listDraftCards } from '@/services/draftRepo'
import { mapDraftBatchGet } from '@/services/mappers'
import { draftBatchGet, draftDelete } from '@/services/wechat'
import { toast } from '@/utils/toast'
import Layout from './Layout.vue'

type Card = DraftCardVM | (LocalDraft & { source?: `local` })
const loading = ref(false)
const error = ref<string>(``)
const drafts = ref<Card[]>([])
const router = useRouter()

async function loadRemote() {
  try {
    loading.value = true
    error.value = ``
    const resp = await draftBatchGet({ offset: 0, count: 20 })
    return mapDraftBatchGet(resp)
  }
  catch (e: any) {
    error.value = e?.message || `加载草稿失败`
    return []
  }
  finally {
    loading.value = false
  }
}

function loadLocal(): Card[] {
  return listDraftCards().map(c => ({ ...c, source: `local` }))
}

async function refresh() {
  const remote = await loadRemote()
  const local = loadLocal()
  drafts.value = [...remote, ...local]
}

async function remove(card: Card) {
  try {
    if ((card as any).source === `local`) {
      deleteDraft(card.id)
      toast.success(`已删除本地草稿`)
    }
    else {
      await draftDelete(card.id)
      toast.success(`已删除远端草稿`)
    }
  }
  catch (e: any) {
    toast.error(`删除失败：${e?.message || e}`)
  }
  finally {
    refresh()
  }
}

function createNew() {
  const id = createDraft()
  // 使用路由跳转，避免在子路径下丢失 base
  router.push({ name: `draftEdit`, params: { id } })
}

function open(card: Card) {
  // 统一跳转到编辑页，由编辑页逻辑决定如何处理远端/本地草稿
  router.push({ name: `draftEdit`, params: { id: (card as any).id } })
}

onMounted(refresh)
</script>

<template>
  <Layout>
    <section class="wrap">
      <div class="grid">
        <div class="card new" @click="createNew">
          <div class="title">
            新的创作
          </div>
        </div>
        <div v-if="loading" class="card loading">
          加载中…
        </div>
        <div v-if="!loading && error" class="card error">
          {{ error }}
        </div>
        <div v-for="d in drafts" :key="d.id" class="card" @click="open(d)">
          <div class="title">
            {{ d.title }}
          </div>
          <div class="meta">
            更新时间：{{ d.updatedAt }} <small v-if="(d as any).source === 'local'">（本地）</small>
          </div>
          <button class="del" @click.stop="remove(d)">
            删除
          </button>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.wrap {
  padding: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  position: relative;
}
.card.loading,
.card.error {
  grid-column: 1/-1;
  text-align: center;
  color: #666;
}
.card.new {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
}
.title {
  font-weight: 600;
  cursor: pointer;
}
.meta {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}
.del {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 12px;
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
