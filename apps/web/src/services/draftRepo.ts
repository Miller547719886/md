import { useStore } from '@/stores'

export interface DraftCard { id: string, title: string, updatedAt: string }

/** 返回用于列表展示的草稿信息 */
export function listDraftCards(): DraftCard[] {
  const store = useStore()
  return store.posts.map(p => ({
    id: p.id,
    title: p.title || ``,
    updatedAt: new Date(p.updateDatetime || new Date()).toLocaleString(),
  }))
}

/** 新建草稿并返回其 id */
export function createDraft(title = ``): string {
  const store = useStore()
  store.addPost(title)
  return store.currentPostId
}

/** 删除草稿 */
export function deleteDraft(id: string): void {
  const store = useStore()
  store.delPost(id)
}

/** 确保当前编辑草稿存在；若无 id 则新建，若有则切换 */
export function ensureEditingDraft(id?: string): string {
  const store = useStore()
  if (!id) {
    return createDraft()
  }
  const exists = store.posts.some(p => p.id === id)
  if (exists) {
    store.currentPostId = id
    return id
  }
  // 未找到则视为新建
  return createDraft()
}
