import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { setupComponents } from './utils/setup-components'

import 'vue-sonner/style.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/theme/darcula.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/css-hint'
import 'codemirror/addon/search/search' // 搜索功能
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/dialog/dialog' // 搜索替换功能
import 'codemirror/addon/dialog/dialog.css'

// 主动卸载旧版 Service Worker（历史发布遗留）
if (typeof window !== `undefined` && `serviceWorker` in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => {
      // 仅清理本站域名下的注册
      reg.unregister().catch(() => {})
    })
  })

  // 清理旧缓存
  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach(key => caches.delete(key))
    }).catch(() => {})
  }
}

setupComponents()

const app = createApp(App)

app.use(createPinia())

app.mount(`#app`)
