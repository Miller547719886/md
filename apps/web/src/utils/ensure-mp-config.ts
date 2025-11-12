// 在编辑器加载时确保“公众号图床”配置可用，避免用户手动点“保存配置”
export function ensureMpUploadReady() {
  try {
    // 强制将当前图床设为 mp（公众号）
    localStorage.setItem(`imgHost`, `mp`)

    // 若已有配置则不覆盖
    if (localStorage.getItem(`mpConfig`))
      return

    // 优先从环境变量读取
    // Vite 注入的环境变量：VITE_WECHAT_APP_ID / VITE_WECHAT_APP_SECRET / VITE_WECHAT_PROXY_ORIGIN
    const appID = (import.meta as any).env?.VITE_WECHAT_APP_ID || `wxd7ab5c47c6af8afc`
    const appsecret = (import.meta as any).env?.VITE_WECHAT_APP_SECRET || `0b13d51ce03d8e53011bb078a6c2b640`
    const isDev = (import.meta as any).env?.DEV === true
    const proxyFromEnv = (import.meta as any).env?.VITE_WECHAT_PROXY_ORIGIN || ``
    const proxyOrigin = isDev ? `/wx` : proxyFromEnv

    const cfg = { proxyOrigin, appID, appsecret }
    localStorage.setItem(`mpConfig`, JSON.stringify(cfg))
  }
  catch (e) {
    console.warn(`ensureMpUploadReady failed`, e)
  }
}

