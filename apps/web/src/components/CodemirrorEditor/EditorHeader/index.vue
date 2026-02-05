<script setup lang="ts">
import { getDefaultMpProfile } from '@md/shared/configs'
import { driver } from 'driver.js'
import { ChevronDownIcon, Menu, Settings } from 'lucide-vue-next'
import { computed, h, markRaw, nextTick, onMounted, onUnmounted, ref } from 'vue'
import img01 from '@/assets/images/01.png'
import img02 from '@/assets/images/02.png'
import img03 from '@/assets/images/03.png'
import img04 from '@/assets/images/04.png'
import img05 from '@/assets/images/05.png'
import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'
import { copyHtml } from '@/utils/clipboard'
import CopyGuideToast from './CopyGuideToast.vue'
import FormatDropdown from './FormatDropdown.vue'
import 'driver.js/dist/driver.css'

const emit = defineEmits([`startCopy`, `endCopy`])

const store = useStore()

const { output, primaryColor, editor, glossaryEntries, authorName, reviewerName, references } = storeToRefs(store)

const { editorRefresh } = store
const GUIDE_STORAGE_KEY = addPrefix(`usageGuideShown`)

// 对话框状态
const aboutDialogVisible = ref(false)
const fundDialogVisible = ref(false)
const editorStateDialogVisible = ref(false)
const copyGuideDialogVisible = ref(false)
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
  const hasEmptyReference = references.value.some(item => !item.content.trim())
  if (hasReferenceItem && hasEmptyReference)
    missing.push(`参考文献`)

  // 名词解释：仅当正文生成了名词解释时才校验释义
  const hasGlossary = glossaryEntries.value.length > 0
  const hasEmptyGlossaryValue = glossaryEntries.value.some(item => !item.value.trim())
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

const copyMode = useStorage(addPrefix(`copyMode`), `txt`)

const { copy: copyContent } = useClipboard({
  legacy: true,
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
  ].filter(Boolean).join(` `)

  return `<p style="text-align: center; font-size: 14px; margin: 1em 0 16px 0; color: rgba(0,0,0,0.55)">点击下方卡片关注我们,了解更多生涯资讯~</p>
<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" ${attrs}></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`
}

// 复制到微信公众号
async function copy() {
  // 先执行格式化前置操作
  await store.formatContent()

  // 如果是 Markdown 源码，直接复制并返回
  if (copyMode.value === `md`) {
    const mdContent = editor.value?.getValue() || ``
    await copyContent(mdContent)
    toast.custom(() => h(markRaw(CopyGuideToast), {
      onGoPaste: () => {
        window.open(`https://mp.weixin.qq.com/cgi-bin/appmsg`, `_blank`, `noreferrer`)
      },
      onOpenGuide: () => {
        openCopyGuideDialog()
      },
    }))
    return
  }

  // 以下处理非 Markdown 的复制流程
  emit(`startCopy`)

  setTimeout(() => {
    nextTick(async () => {
      await processClipboardContent(primaryColor.value)
      const clipboardDiv = document.getElementById(`output`)!

      // 自动添加生涯重塑公众号名片到文章尾部
      const mpCardHtml = buildMpCardHtml()
      clipboardDiv.innerHTML += `<hr style="margin: 24px 0; border-color: rgba(0,0,0,0.1)" />\n`
      clipboardDiv.innerHTML += mpCardHtml

      clipboardDiv.focus()
      window.getSelection()!.removeAllRanges()

      const temp = clipboardDiv.innerHTML

      if (copyMode.value === `txt`) {
        // 使用统一的 HTML 复制工具，内部已做 Clipboard API 能力检测和降级处理
        try {
          const plainText = clipboardDiv.textContent || ``
          await copyHtml(temp, plainText)
        }
        catch (error) {
          toast.error(`复制失败，请联系开发者。${error}`)
          return
        }
      }

      clipboardDiv.innerHTML = output.value

      if (copyMode.value === `html`) {
        await copyContent(temp)
      }
      else if (copyMode.value === `html-and-style`) {
        await copyContent(store.editorContent2HTML())
      }

      // 输出提示：已复制渲染内容，并提供“去粘贴”和“后续如何操作？”入口
      toast.custom(() => h(markRaw(CopyGuideToast), {
        onGoPaste: () => {
          window.open(`https://mp.weixin.qq.com/cgi-bin/appmsg`, `_blank`, `noreferrer`)
        },
        onOpenGuide: () => {
          openCopyGuideDialog()
        },
      }))
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
        element: `#markdown-guide-btn`,
        popover: {
          title: `Markdown 教程`,
          description: `点击这里查看完整 Markdown 教程。`,
          side: `bottom`,
          align: `start`,
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
        <StyleDropdown />
        <HelpDropdown @open-about="handleOpenAbout" @open-fund="handleOpenFund" />
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
            <FileDropdown :as-sub="true" @open-editor-state="handleOpenEditorState" />
            <FormatDropdown :as-sub="true" />
            <span class="edit-button inline-flex">
              <EditDropdown :as-sub="true" />
            </span>
            <StyleDropdown :as-sub="true" />
            <HelpDropdown :as-sub="true" @open-about="handleOpenAbout" @open-fund="handleOpenFund" />
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <!-- 右侧操作区 -->
    <div class="space-x-2 flex flex-wrap items-center">
      <!-- 使用向导按钮 -->
      <Button
        class="use-tutorial text-sm"
        variant="outline"
        @click="openGuide"
      >
        使用向导
      </Button>

      <!-- 复制按钮组 -->
      <div
        id="copy-actions"
        class="bg-background space-x-1 text-background-foreground flex items-center border rounded-md"
      >
        <Button variant="ghost" class="shadow-none text-sm px-2 md:px-4" @click="handleCopyClick">
          复制
        </Button>
        <Separator orientation="vertical" class="h-5" />
        <DropdownMenu v-model="copyMode">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="px-2 shadow-none">
              <ChevronDownIcon class="text-secondary-foreground h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :align-offset="-5" class="w-[200px]">
            <DropdownMenuRadioGroup v-model="copyMode">
              <DropdownMenuRadioItem value="txt">
                公众号格式
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="html">
                HTML 格式
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="html-and-style">
                HTML 格式（兼容样式）
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="md">
                MD 格式
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
  <AboutDialog :visible="aboutDialogVisible" @close="aboutDialogVisible = false" />
  <FundDialog :visible="fundDialogVisible" @close="fundDialogVisible = false" />
  <EditorStateDialog :visible="editorStateDialogVisible" @close="editorStateDialogVisible = false" />
  <AlertDialog v-model:open="copyAppendixDialogVisible">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>附录填写校验</AlertDialogTitle>
        <AlertDialogDescription>
          <div
            v-if="appendixWarningHtml"
            v-html="appendixWarningHtml"
          />
          <template v-else>
            {{ appendixWarningText || '附录存在未填写的字段，确认是否继续复制？' }}
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
    <div class="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pb-6 pt-8 sm:px-6">
      <div class="relative h-full max-h-[70vh] w-full max-w-3xl overflow-hidden rounded-md bg-black/40">
        <div
          v-for="(src, index) in guideImages"
          :key="src"
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="copyGuideActiveIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
          <img
            :src="src"
            :alt="`引导图片 ${index + 1}`"
            class="h-full w-full object-contain"
          >
        </div>
      </div>
      <div class="flex w-full max-w-3xl items-center justify-between text-white">
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
            :class="copyGuideActiveIndex === index - 1 ? 'bg-primary' : 'bg-white/40'"
          />
        </div>
        <button
          type="button"
          class="rounded border border-white/50 px-3 py-1 text-xs hover:bg-white/10"
          @click="goNextGuide"
        >
          {{ copyGuideActiveIndex === COPY_GUIDE_TOTAL - 1 ? '完成' : '下一张' }}
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
