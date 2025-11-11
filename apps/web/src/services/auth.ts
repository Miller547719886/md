import { getStableAccessToken } from './wechat'

interface TokenCache { access_token: string, expire: number }
const KEY = `mpStableAccessToken`

export async function getAccessToken(): Promise<string> {
  const cached = localStorage.getItem(KEY)
  if (cached) {
    try {
      const obj = JSON.parse(cached) as TokenCache
      if (obj.expire > Date.now() + 10_000)
        return obj.access_token
    }
    catch {}
  }
  const resp = await getStableAccessToken()
  if (!resp?.access_token)
    throw new Error(resp?.errmsg || `获取 access_token 失败`)
  const expire = Date.now() + (resp.expires_in || 7000) * 1000 - 60_000 // 提前1分钟刷新
  localStorage.setItem(KEY, JSON.stringify({ access_token: resp.access_token, expire }))
  return resp.access_token
}

export function clearAccessToken() {
  localStorage.removeItem(KEY)
}
