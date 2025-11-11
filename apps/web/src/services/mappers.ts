// 将微信接口返回映射为前端卡片/列表视图模型

export interface DraftCardVM { id: string, title: string, updatedAt: string, source: `remote` | `local` }
export function mapDraftBatchGet(resp: any): DraftCardVM[] {
  if (!resp || !Array.isArray(resp.item))
    return []
  return resp.item.map((it: any) => {
    const first = it?.content?.news_item?.[0] || {}
    const title = first.title || ``
    const updatedAt = it.update_time ? new Date(it.update_time * 1000).toLocaleString() : ``
    return { id: it.media_id, title, updatedAt, source: `remote` }
  })
}

export interface PublishItemVM { id: string, title: string, publishedAt: string }
export function mapPublishBatchGet(resp: any): PublishItemVM[] {
  if (!resp || !Array.isArray(resp.item))
    return []
  return resp.item.map((it: any) => {
    const first = it?.content?.news_item?.[0] || {}
    const title = first.title || `未命名`
    const publishedAt = it.update_time ? new Date(it.update_time * 1000).toLocaleString() : ``
    const id = it.article_id || it.publish_id || first?.url || `${it.update_time}`
    return { id, title, publishedAt }
  })
}
