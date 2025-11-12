import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupComponents } from './utils/setup-components'
import { ensureMpUploadReady } from '@/utils/ensure-mp-config'

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

setupComponents()

// 应用启动阶段初始化公众号图床配置，保证任意页面（含素材库）可直接使用
ensureMpUploadReady()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount(`#app`)
