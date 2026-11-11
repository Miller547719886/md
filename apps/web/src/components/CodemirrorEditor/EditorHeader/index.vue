<script setup lang="ts">
import { getDefaultMpProfile } from '@md/shared/configs'
import { isGzhTheme } from '@md/shared/gzh'
import { driver } from 'driver.js'
import { Menu, Settings } from 'lucide-vue-next'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import img01 from '@/assets/images/01.png'
import img02 from '@/assets/images/02.png'
import img03 from '@/assets/images/03.png'
import img04 from '@/assets/images/04.png'
import img05 from '@/assets/images/05.png'
import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'
import { copyHtml } from '@/utils/clipboard'
import FormatDropdown from './FormatDropdown.vue'
import 'driver.js/dist/driver.css'

const emit = defineEmits([`startCopy`, `endCopy`])

const store = useStore()

const {
  output,
  primaryColor,
  glossaryEntries,
  authorName,
  reviewerName,
  references,
  theme,
} = storeToRefs(store)

const { editorRefresh } = store
const GUIDE_STORAGE_KEY = addPrefix(`usageGuideShown`)

// 对话框状态
const aboutDialogVisible = ref(false)
const fundDialogVisible = ref(false)
const editorStateDialogVisible = ref(false)
const copyGuideDialogVisible = ref(false)
const copySuccessDialogVisible = ref(false)
const copyGuideActiveIndex = ref(0)
const COPY_GUIDE_TOTAL = 5
const guideImages = [img01, img02, img03, img04, img05]
const copyAppendixDialogVisible = ref(false)

// 附录填写校验：作者/审核/参考文献任一为空，或存在名词解释但释义为空时，触发提醒
const missingAppendixFields = computed(() => {
  const missing: string[] = []

  if (!authorName.value.trim())
    missing.push(`作者`)

  if (!reviewerName.value.trim())
    missing.push(`审核`)

  // 参考文献：存在项且任意为空即视为缺失；若列表为空则不强制
  const hasReferenceItem = references.value.length > 0
  const hasEmptyReference = references.value.some(
    item => !item.content.trim(),
  )
  if (hasReferenceItem && hasEmptyReference)
    missing.push(`参考文献`)

  // 名词解释：仅当正文生成了名词解释时才校验释义
  const hasGlossary = glossaryEntries.value.length > 0
  const hasEmptyGlossaryValue = glossaryEntries.value.some(
    item => !item.value.trim(),
  )
  if (hasGlossary && hasEmptyGlossaryValue)
    missing.push(`名词解释释义`)

  return missing
})

const appendixWarningText = computed(() => {
  if (missingAppendixFields.value.length === 0)
    return ``
  const list = missingAppendixFields.value.join(`、`)
  return `以下附录字段未填写：${list}，确认是否继续复制？`
})

const appendixWarningHtml = computed(() => {
  if (missingAppendixFields.value.length === 0)
    return ``
  const list = missingAppendixFields.value
    .map(field => `<strong>${field}</strong>`)
    .join(`、`)
  return `以下附录字段未填写：${list}，确认是否继续复制？`
})

// 处理帮助菜单事件
function handleOpenAbout() {
  aboutDialogVisible.value = true
}

function handleOpenFund() {
  fundDialogVisible.value = true
}

function handleOpenEditorState() {
  editorStateDialogVisible.value = true
}

function openCopyGuideDialog() {
  copyGuideDialogVisible.value = true
}

function handleGoPaste() {
  window.open(
    `https://mp.weixin.qq.com/cgi-bin/appmsg`,
    `_blank`,
    `noreferrer`,
  )
  copySuccessDialogVisible.value = false
}

function handleOpenGuideFromCopySuccess() {
  copySuccessDialogVisible.value = false
  openCopyGuideDialog()
}

function goNextGuide() {
  // 最后一张时，点击“完成”关闭弹窗并复位索引
  if (copyGuideActiveIndex.value === COPY_GUIDE_TOTAL - 1) {
    copyGuideDialogVisible.value = false
    copyGuideActiveIndex.value = 0
    return
  }
  copyGuideActiveIndex.value += 1
}

function goPrevGuide() {
  copyGuideActiveIndex.value
    = (copyGuideActiveIndex.value - 1 + COPY_GUIDE_TOTAL) % COPY_GUIDE_TOTAL
}

function closeCopyGuide() {
  copyGuideDialogVisible.value = false
  copyGuideActiveIndex.value = 0
}

function handleGuideKeydown(e: KeyboardEvent) {
  if (e.key === `Escape`) {
    closeCopyGuide()
  }

  if (!copyGuideDialogVisible.value)
    return

  if (e.key === `ArrowRight`) {
    goNextGuide()
  }
  else if (e.key === `ArrowLeft`) {
    goPrevGuide()
  }
}

onMounted(() => {
  window.addEventListener(`keydown`, handleGuideKeydown)
  tryAutoGuide()
})

onUnmounted(() => {
  window.removeEventListener(`keydown`, handleGuideKeydown)
})

// 生成公众号名片HTML
function buildMpCardHtml() {
  const profile = getDefaultMpProfile()
  const attrs = [
    `data-pluginname="mpprofile"`,
    `data-id="${profile.id}"`,
    `data-nickname="${profile.name}"`,
    `data-headimg="${profile.logo}"`,
    `data-signature="${profile.desc}"`,
    `data-service_type="1"`,
    `data-verify_status="1"`,
  ]
    .filter(Boolean)
    .join(` `)

  return `<p style="text-align: center; font-size: 14px; margin: 1em 0 16px 0; color: rgba(0,0,0,0.55)">点击下方卡片关注我们,了解更多生涯资讯~</p>
<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

// 复制到微信公众号
async function copy() {
  // 先执行格式化前置操作
  const hasAutoToc = await store.formatContent()

  emit(`startCopy`)

  setTimeout(() => {
    nextTick(async () => {
      await processClipboardContent(primaryColor.value, {
        skipHljs: isGzhTheme(theme.value),
      })
      const clipboardDiv = document.getElementById(`output`)!
      const hasCopiedAutoToc = () =>
        Boolean(clipboardDiv.querySelector(`[data-auto-toc="true"]`))

      // 检查自动目录是否留在待复制内容中，缺失时用刚刷新的预览重新准备一次。
      if (hasAutoToc && !hasCopiedAutoToc()) {
        clipboardDiv.innerHTML = output.value
        await processClipboardContent(primaryColor.value, {
          skipHljs: isGzhTheme(theme.value),
        })
      }

      if (hasAutoToc && !hasCopiedAutoToc()) {
        clipboardDiv.innerHTML = output.value
        toast.error(`复制前未检测到自动目录，已取消本次复制，请重试。`)
        emit(`endCopy`)
        return
      }

      // 自动添加生涯重塑公众号名片到文章尾部
      const mpCardHtml = buildMpCardHtml()
      clipboardDiv.innerHTML += `<hr style="margin: 24px 0; border-color: rgba(0,0,0,0.1)" />\n`
      clipboardDiv.innerHTML += mpCardHtml

      clipboardDiv.focus()
      window.getSelection()!.removeAllRanges()

      const temp = clipboardDiv.innerHTML

      // 使用统一的 HTML 复制工具，内部已做 Clipboard API 能力检测和降级处理
      try {
        const plainText = clipboardDiv.textContent || ``
        await copyHtml(temp, plainText)
      }
      catch (error) {
        toast.error(`复制失败，请联系开发者。${error}`)
        return
      }

      clipboardDiv.innerHTML = output.value

      copySuccessDialogVisible.value = true
      window.dispatchEvent(
        new CustomEvent(`copyToMp`, {
          detail: {
            content: output.value,
          },
        }),
      )
      editorRefresh()
      emit(`endCopy`)
    })
  }, 350)
}

// 处理复制按钮点击：若附录为空则先提醒
function handleCopyClick() {
  if (missingAppendixFields.value.length > 0) {
    copyAppendixDialogVisible.value = true
    return
  }

  copy()
}

// 提醒弹窗内确认继续复制
function handleConfirmCopy() {
  copyAppendixDialogVisible.value = false
  copy()
}

// 打开使用向导
function openGuide() {
  localStorage.setItem(GUIDE_STORAGE_KEY, `1`)
  const guide = driver({
    showProgress: true,
    nextBtnText: `下一步`,
    prevBtnText: `上一步`,
    doneBtnText: `完成`,
    steps: [
      {
        element: `.editor-main`,
        popover: {
          title: `正文编辑区`,
          description: `在这里创作你的内容（参考样例文章“照猫画虎”即可上手）。`,
          side: `right`,
          align: `start`,
        },
      },
      {
        element: `.codeMirror-wrapper .CodeMirror`,
        popover: {
          title: `图片拖放上传`,
          description: `将 JPG/JPEG、PNG 或 GIF 图片（每张不超过 10 MB）拖到这里，编辑器会使用当前图床自动上传；未选择图床时默认使用腾讯云 COS，并在拖放位置插入 Markdown 图片语法（![](图片链接)）。多张图片会依次处理。`,
          side: `right`,
          align: `start`,
        },
      },
      {
        element: `#markdown-guide-btn`,
        popover: {
          title: `Markdown 教程`,
          description: `点击这里查看完整 Markdown 教程。`,
          side: `bottom`,
          align: `start`,
        },
      },
      {
        element: `.tips-marquee`,
        popover: {
          title: `快捷键速查`,
          description: `鼠标悬浮在这个区域，可以速览全部快捷键。`,
          side: `top`,
          align: `center`,
        },
      },
      {
        element: `.meta-content`,
        popover: {
          title: `附录编辑区`,
          description: `在这里补充名词解释、作者、参考文献等信息。`,
          side: `right`,
          align: `start`,
        },
      },
      {
        element: `.edit-button`,
        popover: {
          title: `编辑菜单`,
          description: `点击“编辑” -> “上传图片”以添加图片资源；点击“编辑” -> “插入表格”以添加表格。`,
          side: `bottom`,
          align: `start`,
        },
      },
      {
        element: `.preview`,
        popover: {
          title: `右侧预览`,
          description: `在这里预览文章渲染效果。`,
          side: `left`,
          align: `center`,
        },
      },
      {
        element: `#copy-actions`,
        popover: {
          title: `复制发布`,
          description: `内容确认无误后，就可以复制到公众号平台发布啦！`,
          side: `bottom`,
          align: `center`,
        },
      },
      {
        element: `.use-tutorial`,
        popover: {
          title: `再次查看向导`,
          description: `点击此处再看一遍使用向导。`,
          side: `bottom`,
          align: `end`,
        },
      },
    ],
  })

  guide.drive()
}

function tryAutoGuide() {
  if (localStorage.getItem(GUIDE_STORAGE_KEY) === `1`)
    return

  nextTick(() => {
    // 等待关键节点渲染完成后再启动引导
    setTimeout(() => {
      if (!document.querySelector(`.editor-main`))
        return
      openGuide()
    }, 300)
  })
}
</script>

<template>
  <header
    class="header-container h-15 flex flex-wrap items-center justify-between px-5 relative"
  >
    <!-- 桌面端左侧菜单 -->
    <div class="space-x-2 hidden md:flex">
      <Menubar class="menubar border-0">
        <FileDropdown @open-editor-state="handleOpenEditorState" />
        <FormatDropdown />
        <span class="edit-button inline-flex">
          <EditDropdown />
        </span>
        <span class="style-theme inline-flex">
          <StyleDropdown />
        </span>
        <HelpDropdown
          @open-about="handleOpenAbout"
          @open-fund="handleOpenFund"
        />
      </Menubar>
    </div>

    <!-- 移动端汉堡菜单按钮 -->
    <div class="md:hidden">
      <Menubar class="menubar border-0 p-0">
        <MenubarMenu>
          <MenubarTrigger class="p-0">
            <Button variant="outline" size="icon">
              <Menu class="size-4" />
            </Button>
          </MenubarTrigger>
          <MenubarContent align="start">
            <FileDropdown
              :as-sub="true"
              @open-editor-state="handleOpenEditorState"
            />
            <FormatDropdown :as-sub="true" />
            <span class="edit-button inline-flex">
              <EditDropdown :as-sub="true" />
            </span>
            <span class="style-theme inline-flex">
              <StyleDropdown :as-sub="true" />
            </span>
            <HelpDropdown
              :as-sub="true"
              @open-about="handleOpenAbout"
              @open-fund="handleOpenFund"
            />
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <!-- 右侧操作区 -->
    <div class="space-x-2 flex flex-wrap items-center">
      <!-- 使用向导按钮 -->
      <Button class="use-tutorial text-sm" variant="outline" @click="openGuide">
        使用向导
      </Button>

      <Button variant="outline" class="text-sm" @click="store.formatContent()">
        格式化
      </Button>

      <!-- 公众号复制按钮 -->
      <div
        id="copy-actions"
        class="bg-background text-background-foreground flex items-center border rounded-md"
      >
        <Button
          variant="ghost"
          class="shadow-none text-sm px-2 md:px-4"
          @click="handleCopyClick"
        >
          复制
        </Button>
      </div>

      <!-- 文章信息（移动端隐藏） -->
      <PostInfo class="hidden md:inline-flex" />

      <!-- 设置按钮 -->
      <Button
        variant="outline"
        size="icon"
        @click="store.isOpenRightSlider = !store.isOpenRightSlider"
      >
        <Settings class="size-4" />
      </Button>
    </div>
  </header>

  <!-- 对话框组件，嵌套菜单无法正常挂载，需要提取层级 -->
  <AboutDialog
    :visible="aboutDialogVisible"
    @close="aboutDialogVisible = false"
  />
  <FundDialog :visible="fundDialogVisible" @close="fundDialogVisible = false" />
  <EditorStateDialog
    :visible="editorStateDialogVisible"
    @close="editorStateDialogVisible = false"
  />
  <AlertDialog v-model:open="copyAppendixDialogVisible">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>附录填写校验</AlertDialogTitle>
        <AlertDialogDescription>
          <div v-if="appendixWarningHtml" v-html="appendixWarningHtml" />
          <template v-else>
            {{
              appendixWarningText || "附录存在未填写的字段，确认是否继续复制？"
            }}
          </template>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>去完善附录</AlertDialogCancel>
        <AlertDialogAction @click="handleConfirmCopy">
          确认复制
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <Dialog v-model:open="copySuccessDialogVisible">
    <DialogContent
      class="!fixed !inset-0 !left-0 !top-0 !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 !gap-0 !rounded-none !border-0 !bg-transparent !p-6 !shadow-none grid place-items-center"
    >
      <div
        class="w-full max-w-2xl space-y-6 rounded-xl border bg-background p-8 text-center shadow-2xl sm:p-12"
      >
        <div
          aria-hidden="true"
          class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary"
        >
          ✓
        </div>
        <div class="space-y-2">
          <DialogTitle class="text-2xl font-bold sm:text-3xl">
            复制成功
          </DialogTitle>
          <DialogDescription class="text-base leading-7">
            已复制渲染后的文章和公众号名片，可直接粘贴到公众号后台。
          </DialogDescription>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <Button @click="handleGoPaste">
            去公众号后台粘贴
          </Button>
          <Button
            variant="outline"
            @click="handleOpenGuideFromCopySuccess"
          >
            查看后续操作指南
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 复制后操作引导全屏轮播 -->
  <div
    v-if="copyGuideDialogVisible"
    class="fixed inset-0 z-[10000] flex flex-col bg-black/80"
  >
    <button
      type="button"
      class="absolute right-6 top-6 rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
      @click="closeCopyGuide"
    >
      关闭
    </button>
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pb-6 pt-8 sm:px-6"
    >
      <div
        class="relative h-full max-h-[70vh] w-full max-w-3xl overflow-hidden rounded-md bg-black/40"
      >
        <div
          v-for="(src, index) in guideImages"
          :key="src"
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="
            copyGuideActiveIndex === index
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          "
        >
          <img
            :src="src"
            :alt="`引导图片 ${index + 1}`"
            class="h-full w-full object-contain"
          >
        </div>
      </div>
      <div
        class="flex w-full max-w-3xl items-center justify-between text-white"
      >
        <button
          type="button"
          class="rounded border border-white/50 px-3 py-1 text-xs hover:bg-white/10"
          @click="goPrevGuide"
        >
          上一张
        </button>
        <div class="flex items-center gap-1">
          <span
            v-for="index in COPY_GUIDE_TOTAL"
            :key="index"
            class="h-2 w-2 rounded-full"
            :class="
              copyGuideActiveIndex === index - 1 ? 'bg-primary' : 'bg-white/40'
            "
          />
        </div>
        <button
          type="button"
          class="rounded border border-white/50 px-3 py-1 text-xs hover:bg-white/10"
          @click="goNextGuide"
        >
          {{
            copyGuideActiveIndex === COPY_GUIDE_TOTAL - 1 ? "完成" : "下一张"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.menubar {
  user-select: none;
}

kbd {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #a8a8a8;
  padding: 1px 4px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .menubar {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    > * {
      width: 100%;
      justify-content: flex-start;
    }
  }
}
</style>
