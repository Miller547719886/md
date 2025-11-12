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

/**
 * 从远端草稿（media_id）创建本地草稿，并绑定 wxMediaId，用于后续保存走 draft.update
 */
export function createDraftFromRemote(mediaId: string, title = ``): string {
  const store = useStore()
  store.addPost(title)
  const id = store.currentPostId
  const post = store.getPostById(id)
  if (post)
    post.wxMediaId = mediaId
  return id
}

/** 删除草稿 */
export function deleteDraft(id: string): void {
  const store = useStore()
  store.delPost(id)
}

/** 确保当前编辑草稿存在；若无 id 则新建，若有则切换 */
export function ensureEditingDraft(id?: string): string {
  const store = useStore()
  // 无参 ➜ 新建
  if (!id) {
    return createDraft()
  }
  // 有参且是本地草稿 id ➜ 切换到该草稿
  const exists = store.posts.some(p => p.id === id)
  if (exists) {
    store.currentPostId = id
    return id
  }
  // 有参但找不到 ➜ 视为“从远端打开”，新建本地草稿并记录远端 media_id
  const newId = createDraft()
  const post = store.getPostById(newId) as any
  // 简单判断：形如微信 media_id 的字符串（不含 `-` 的长串）
  if (typeof id === 'string' && id.length >= 10 && !id.includes('-')) {
    post.wxMediaId = id
  }
  return newId
}
