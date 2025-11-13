/**
 * 微信公众号 API 客户端（骨架）
 * - 阶段一：仅声明接口与类型，不在页面直接调用；待联调时实现。
 * - 鉴权：使用稳定版 access_token；建议由服务端代理，前端仅调用代理地址。
 */
import fetch from '@md/shared/utils/fetch'
import { clearAccessToken, getAccessToken } from './auth'

// 在开发模式下，使用 Vite 代理前缀 `/wx` 以规避 CORS；
// 生产环境或未开启代理时，仍可通过 VITE_WECHAT_PROXY_ORIGIN 配置代理服务端地址；
// 否则回退到官方域名（将受 CORS 限制）。
const BASE = import.meta.env.DEV
  ? `/wx`
  : (import.meta.env.VITE_WECHAT_PROXY_ORIGIN || `https://api.weixin.qq.com`)
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
  try {
    const res: any = await fetch(url, opts)
    // 正常 data 已在拦截器处理 errcode==0 情况，这里直接返回
    return res as T
  }
  catch (e: any) {
    // 针对 access_token 相关错误，清理并重试一次
    const errcode = e?.data?.errcode
    if (retry && [40001, 40014, 42001].includes(errcode)) {
      clearAccessToken()
      return requestWithRetry<T>(path, opts, false)
    }
    throw e
  }
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
  // 改为永久素材上传，获取可用于内容的 URL 以及 media_id（用于图片消息 image_info）
  // 对应官方接口：/cgi-bin/material/add_material?type=image
  return requestWithRetry<{ media_id: string, url: string }>(`/cgi-bin/material/add_material?type=image`, { method: `POST`, data: { media: file, upload: true } })
}

// 素材管理（永久素材）
export async function materialBatchGet(params: { type: 'image' | 'video' | 'voice' | 'news', offset: number, count: number }) {
  return requestWithRetry(`/cgi-bin/material/batchget_material`, { method: `POST`, data: params })
}
export async function materialDelete(media_id: string) {
  return requestWithRetry(`/cgi-bin/material/del_material`, { method: `POST`, data: { media_id } })
}
export async function materialGet(media_id: string) {
  return requestWithRetry(`/cgi-bin/material/get_material`, { method: `POST`, data: { media_id } })
}
export async function materialGetCount() {
  return requestWithRetry(`/cgi-bin/material/get_materialcount`, { method: `GET` })
}
export async function materialAdd({ type, file }: { type: 'image' | 'voice' | 'video' | 'thumb', file: File }) {
  return requestWithRetry(`/cgi-bin/material/add_material?type=${type}`, { method: `POST`, data: { media: file, upload: true } })
}

// 基础接口补充
// 网络通信检测
export async function callbackCheck(data: { action: 'all' | 'dns' | 'ping' | 'shortconnect', check_operator?: 'DEFAULT' | 'UNICOM' | 'CT' | 'CMCC' }) {
  return requestWithRetry(`/cgi-bin/callback/check`, { method: `POST`, data })
}
// 查询 rid 信息
export async function getRidInfo(rid: string) {
  return requestWithRetry(`/cgi-bin/openapi/rid/get`, { method: `POST`, data: { rid } })
}
// 使用 AppSecret 重置 API 调用次数
export async function clearQuotaByAppSecret(appid?: string, secret?: string) {
  const a = appid ?? APP_ID
  const s = secret ?? APP_SECRET
  const url = `${BASE}/cgi-bin/clear_quota/v2?appid=${encodeURIComponent(a as string)}&appsecret=${encodeURIComponent(s as string)}`
  return fetch(url, { method: `GET` })
}

// 环境变量约定（Vite）：
// - VITE_WECHAT_APP_ID
// - VITE_WECHAT_APP_SECRET
// - VITE_WECHAT_PROXY_ORIGIN  （建议指向你后端代理域名）
