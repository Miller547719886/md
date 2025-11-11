/**
 * 微信公众号 API 客户端（骨架）
 * - 阶段一：仅声明接口与类型，不在页面直接调用；待联调时实现。
 * - 鉴权：使用稳定版 access_token；建议由服务端代理，前端仅调用代理地址。
 */
import fetch from '@md/shared/utils/fetch'
import { clearAccessToken, getAccessToken } from './auth'

const BASE = import.meta.env.VITE_WECHAT_PROXY_ORIGIN || `https://api.weixin.qq.com`
const APP_ID = import.meta.env.VITE_WECHAT_APP_ID
const APP_SECRET = import.meta.env.VITE_WECHAT_APP_SECRET

export function getEnvCreds() {
  return { appid: APP_ID as string, secret: APP_SECRET as string }
}

export interface AccessTokenResp { access_token: string, expires_in: number, errcode?: number, errmsg?: string }
export async function getStableAccessToken(appid?: string, secret?: string) {
  const url = `${BASE}/cgi-bin/stable_token`
  const a = appid ?? APP_ID
  const s = secret ?? APP_SECRET
  return fetch<any, AccessTokenResp>(url, { method: `POST`, data: { grant_type: `client_credential`, appid: a, secret: s } })
}

// 草稿管理
export interface DraftItem { media_id: string, content: any, update_time: number }
export interface DraftListResp { total_count: number, item_count: number, item: DraftItem[] }
async function withToken(path: string) {
  const token = await getAccessToken()
  const sep = path.includes(`?`) ? `&` : `?`
  return `${BASE}${path}${sep}access_token=${token}`
}

async function requestWithRetry<T = any>(path: string, opts: any, retry = true): Promise<T> {
  const url = await withToken(path)
  const res: any = await fetch(url, opts)
  // 令牌相关错误：40001(不合法的access_token)、40014(不合法的access_token)、42001(超时)
  if (res && typeof res === `object` && res.errcode && [40001, 40014, 42001].includes(res.errcode)) {
    if (retry) {
      clearAccessToken()
      return requestWithRetry<T>(path, opts, false)
    }
  }
  return res as T
}

export async function draftBatchGet(params: { offset: number, count: number }) {
  return requestWithRetry<DraftListResp>(`/cgi-bin/draft/batchget`, { method: `POST`, data: params })
}
export async function draftAdd(data: any) {
  return requestWithRetry(`/cgi-bin/draft/add`, { method: `POST`, data })
}
export async function draftUpdate(data: any) {
  return requestWithRetry(`/cgi-bin/draft/update`, { method: `POST`, data })
}
export async function draftDelete(media_id: string) {
  return requestWithRetry(`/cgi-bin/draft/delete`, { method: `POST`, data: { media_id } })
}
export async function draftGet(media_id: string) {
  return requestWithRetry(`/cgi-bin/draft/get`, { method: `POST`, data: { media_id } })
}

// 发布能力
export async function freePublishSubmit(media_id: string) {
  return requestWithRetry(`/cgi-bin/freepublish/submit`, { method: `POST`, data: { media_id } })
}
export async function freePublishBatchGet(params: { offset: number, count: number }) {
  return requestWithRetry(`/cgi-bin/freepublish/batchget`, { method: `POST`, data: params })
}
export async function freePublishGetArticle(article_id: string) {
  return requestWithRetry(`/cgi-bin/freepublish/getarticle`, { method: `POST`, data: { article_id } })
}
export async function freePublishDelete(article_id: string) {
  return requestWithRetry(`/cgi-bin/freepublish/delete`, { method: `POST`, data: { article_id } })
}

// 上传图文消息内的图片（返回可用于内容的 URL）
export async function uploadContentImage(file: File) {
  // 对应官方接口：/cgi-bin/media/uploadimg
  return requestWithRetry<{ url: string }>(`/cgi-bin/media/uploadimg`, { method: `POST`, data: { media: file, upload: true } })
}

// 环境变量约定（Vite）：
// - VITE_WECHAT_APP_ID
// - VITE_WECHAT_APP_SECRET
// - VITE_WECHAT_PROXY_ORIGIN  （建议指向你后端代理域名）
