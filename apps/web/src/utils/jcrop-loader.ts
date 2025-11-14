// 动态加载 jQuery 与 Jcrop，并在指定 <img> 上初始化固定宽高比(2.35:1)裁剪
export async function ensureJcropLoaded() {
  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
  const loadCss = (href: string) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }

  const win: any = window as any
  if (!win.jQuery) {
    await loadScript('https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js')
  }
  // 加载 Jcrop 样式与脚本
  loadCss('https://cdn.jsdelivr.net/npm/jcrop@0.9.15/css/jquery.Jcrop.min.css')
  if (!win.jQuery?.Jcrop) {
    await loadScript('https://cdn.jsdelivr.net/npm/jcrop@0.9.15/js/jquery.Jcrop.min.js')
  }
  return win.jQuery
}

export interface NormalizedCrop { x1: number, y1: number, x2: number, y2: number }

export async function initJcropWithAspect(imgEl: HTMLImageElement, onChange: (c: NormalizedCrop) => void) {
  const $ = await ensureJcropLoaded()
  return new Promise<{ destroy: () => void, getCrop: () => NormalizedCrop }>((resolve) => {
    const natW = imgEl.naturalWidth
    const natH = imgEl.naturalHeight
    const ratio = 2.35
    // 默认选区：尽量占满宽度的 2.35:1
    const selW = natW
    const selH = Math.min(natH, Math.round(natW / ratio))
    const yTop = Math.max(0, Math.round((natH - selH) / 2))
    let current: NormalizedCrop = { x1: 0, y1: yTop / natH, x2: 1, y2: (yTop + selH) / natH }
    const handle = (c: any) => {
      // c 为基于 trueSize 的像素坐标
      current = { x1: c.x / natW, y1: c.y / natH, x2: (c.x + c.w) / natW, y2: (c.y + c.h) / natH }
      onChange(current)
    }
    let api: any
    $(imgEl).Jcrop({
      aspectRatio: ratio,
      trueSize: [natW, natH],
      setSelect: [0, yTop, selW, yTop + selH],
      onChange: handle,
      onSelect: handle,
    }, function thisReady() {
      api = this
      resolve({ destroy: () => api?.destroy?.(), getCrop: () => current })
    })
  })
}

