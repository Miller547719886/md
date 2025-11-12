import axios from 'axios'

// 提取 rid（可能存在于返回字段或 errmsg 文本中）
function extractRid(data: any): string | undefined {
  if (!data || typeof data !== `object`)
    return undefined
  if (data.rid && typeof data.rid === `string`)
    return data.rid
  const msg = data.errmsg || data.message || ``
  const m = /rid:\s*([0-9a-zA-Z\-]+)/.exec(String(msg))
  return m?.[1]
}

// 从请求 URL 中解析 access_token 与接口前缀（用于拼接 rid 查询地址）
function parseWeChatContext(url?: string): { token?: string, prefix?: string } {
  if (!url)
    return {}
  try {
    const tokenMatch = url.match(/[?&]access_token=([^&]+)/)
    const token = tokenMatch?.[1]
    const idx = url.indexOf(`/cgi-bin/`)
    if (idx >= 0) {
      const prefix = url.slice(0, idx) // 可能为 https://api.weixin.qq.com 或 /wx
      return { token, prefix: prefix || `` }
    }
  }
  catch {}
  return {}
}

// 创建axios实例
const service = axios.create({
  baseURL: ``,
  timeout: 30 * 1000, // 请求超时时间
})

service.interceptors.request.use(
  (config) => {
    if (/^(?:post|put|delete)$/i.test(`${config.method}`)) {
      if (config.data && config.data.upload) {
        config.headers[`Content-Type`] = `multipart/form-data`
      }
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

service.interceptors.response.use(
  async (res) => {
    const data = res.data
    // 正常数据直接返回
    if (!data || typeof data !== `object`)
      return data
    // 微信风格错误：带 errcode 且非 0
    if (Object.prototype.hasOwnProperty.call(data, `errcode`) && data.errcode !== 0) {
      // 避免对 rid 查询本身再次递归
      const skipRid = (res.config.headers as any)?.[`X-Skip-RID`]
      let ridInfo: any = undefined
      let rid: string | undefined = undefined
      try {
        if (!skipRid) {
          rid = extractRid(data)
          const { token, prefix } = parseWeChatContext(res.config.url)
          if (rid && token && prefix !== undefined) {
            const ridUrl = `${prefix}/cgi-bin/openapi/rid/get?access_token=${token}`
            // 使用同一 axios 实例，但跳过 rid 递归
            const ridResp = await service.post(ridUrl, { rid }, { headers: { 'X-Skip-RID': '1' } })
            ridInfo = ridResp
          }
        }
      }
      catch { /* rid 查询失败不阻断主错误流程 */ }
      const err = new Error(`${data.errmsg || '请求失败'} (errcode: ${data.errcode}${rid ? `, rid: ${rid}` : ''})`)
      ;(err as any).data = data
      if (ridInfo)
        (err as any).ridInfo = ridInfo
      return Promise.reject(err)
    }
    return data
  },
  error => Promise.reject(error),
)

export default service
