import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: `/`, name: `home`, component: () => import(`../views/HomeWelcome.vue`) },
  { path: `/assets`, name: `assets`, component: () => import(`../views/AssetList.vue`) },
  { path: `/drafts`, name: `drafts`, component: () => import(`../views/DraftList.vue`) },
  // 编辑页必须带 id，避免与列表页冲突
  { path: `/drafts/:id`, name: `draftEdit`, component: () => import(`../views/DraftEdit.vue`), props: true },
  { path: `/publishes`, name: `publishes`, component: () => import(`../views/PublishList.vue`) },
  { path: `/publishes/:id`, name: `publishDetail`, component: () => import(`../views/PublishDetail.vue`), props: true },
]

export const router = createRouter({
  // 与 Vite 的 base 保持一致，避免部署在子路径时白屏
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
