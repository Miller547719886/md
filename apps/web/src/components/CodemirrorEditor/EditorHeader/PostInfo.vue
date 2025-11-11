<script setup lang="ts">
import type { Post } from '@md/shared/types'
import { publishCurrentDraft } from '@/services/publish'
import { useStore } from '@/stores'
import { toast } from '@/utils/toast'

const store = useStore()
const { output, editor } = storeToRefs(store)

const dialogVisible = ref(false)

const form = ref<Post>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  markdown: ``,
  accounts: [],
})

const allowPost = computed(() => true)

async function prePost() {
  // 先执行格式化前置操作
  await store.formatContent()

  // 已移除插件依赖，无需加载账号

  let auto: Post = {
    thumb: ``,
    title: ``,
    desc: ``,
    content: ``,
    markdown: ``,
    accounts: [],
  }
  const accounts = allAccounts.value.filter(a => ![`ipfs`].includes(a.type))
  try {
    auto = {
      thumb: document.querySelector<HTMLImageElement>(`#output img`)?.src ?? ``,
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`)!)
        .find(h => h)
        ?.textContent ?? ``,
      desc: document.querySelector(`#output p`)?.textContent?.trim() ?? ``,
      content: output.value,
      markdown: editor.value?.getValue() ?? ``,
      accounts,
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  finally {
    form.value = {
      ...auto,
    }
  }
}

// 已移除 window.$syncer 相关声明

// 移除第三方账号获取逻辑

async function post() {
  try {
    await publishCurrentDraft()
    toast.success(`已提交发布任务`)
  }
  catch (e: any) {
    console.error(`发布失败:`, e)
    toast.error(`发布失败: ${e?.message || e}`)
  }
  finally {
    dialogVisible.value = false
  }
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}

// 已移除插件检测逻辑
</script>

<template>
  <Dialog v-model:open="dialogVisible" @update:open="onUpdate">
    <DialogTrigger>
      <Button v-if="!store.isMobile" variant="outline" @click="prePost">
        发布
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>发布</DialogTitle>
      </DialogHeader>

      <div class="w-full flex items-center gap-4">
        <Label for="thumb" class="w-10 text-end">
          封面
        </Label>
        <Input id="thumb" v-model="form.thumb" placeholder="自动提取第一张图" />
      </div>
      <div class="w-full flex items-center gap-4">
        <Label for="title" class="w-10 text-end">
          标题
        </Label>
        <Input id="title" v-model="form.title" placeholder="自动提取第一个标题" />
      </div>
      <div class="w-full flex items-start gap-4">
        <Label for="desc" class="w-10 text-end">
          描述
        </Label>
        <Textarea id="desc" v-model="form.desc" placeholder="自动提取第一个段落" />
      </div>

      <!-- 已移除账号（第三方插件）相关 UI -->

      <DialogFooter>
        <Button variant="outline" @click="dialogVisible = false">
          取 消
        </Button>
        <Button :disabled="!allowPost" @click="post">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 已移除第三方插件的发布任务面板 -->
</template>
