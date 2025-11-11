import { useStore } from '@/stores'
import { draftAdd, freePublishGetArticle, freePublishSubmit, uploadContentImage } from './wechat'

function extractTitleAndDigest(html: string) {
  const div = document.createElement(`div`)
  div.innerHTML = html
  const heading = div.querySelector(`h1, h2, h3, h4, h5, h6`)
  const para = div.querySelector(`p`)
  return {
    title: heading?.textContent?.trim() || `未命名标题`,
    digest: para?.textContent?.trim() || ``,
  }
}

async function replaceImagesWithWeChatUrls(html: string) {
  const div = document.createElement(`div`)
  div.innerHTML = html
  const imgs = Array.from(div.querySelectorAll(`img`))
  for (const img of imgs) {
    const src = img.getAttribute(`src`) || ``
    if (!src || /mmbiz\.qpic\.cn|mmbiz\.qlogo\.cn/.test(src))
      continue
    try {
      const resp = await fetch(src)
      const blob = await resp.blob()
      const file = new File([blob], `image.jpg`, { type: blob.type || `image/jpeg` })
      const { url } = await uploadContentImage(file) as any
      if (url)
        img.setAttribute(`src`, url)
    }
    catch (e) {
      // 忽略单张失败，继续其它图片
      console.warn(`上传内容图片失败`, e)
    }
  }
  return div.innerHTML
}

export async function publishCurrentDraft() {
  const store = useStore()
  // 依赖调用方已执行过格式化与渲染（prePost）
  let html = store.output
  html = await replaceImagesWithWeChatUrls(html)
  const { title, digest } = extractTitleAndDigest(html)
  const payload = {
    articles: [
      {
        title,
        author: ``,
        digest,
        content: html,
        // 若后续接入封面，设置 thumb_media_id
      },
    ],
  }
  const addResp = await draftAdd(payload) as any
  if ((addResp as any).errcode && (addResp as any).errcode !== 0) {
    throw new Error((addResp as any).errmsg || `新增草稿失败`)
  }
  const mediaId = (addResp as any).media_id
  if (!mediaId)
    throw new Error(`新增草稿返回缺少 media_id`)
  const pubResp = await freePublishSubmit(mediaId) as any
  if ((pubResp as any).errcode && (pubResp as any).errcode !== 0) {
    throw new Error((pubResp as any).errmsg || `发布草稿失败`)
  }
  // 简单轮询发布状态（基于 getarticle 是否可获取到）
  const maxTries = 10
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
  const articleId = (pubResp as any).publish_id || (pubResp as any).article_id
  for (let i = 0; i < maxTries; i++) {
    try {
      const detail: any = await freePublishGetArticle(articleId)
      if (!detail?.errcode)
        return pubResp
    }
    catch {}
    await delay(1500)
  }
  return pubResp
}
