<script setup lang="ts">
import { draftAdd, draftUpdate, uploadContentImage } from '@/services/wechat'
import PublishSettingsDialog from './PublishSettingsDialog.vue'
import { useStore } from '@/stores'
import { toast } from '@/utils/toast'

const store = useStore()
const saving = ref(false)
const publishDialogOpen = ref(false)

function extractTitleAndDigest(html: string) {
  const div = document.createElement(`div`)
  div.innerHTML = html
  const heading = div.querySelector(`h1, h2, h3, h4, h5, h6`)
  const para = div.querySelector(`p`)
  return {
    title: heading?.textContent?.trim() || `未命名标题`,
    digest: para?.textContent?.trim() || ``,
  }
}

async function replaceImagesWithWeChatUrlsAndCollectMedia(html: string) {
  const div = document.createElement(`div`)
  div.innerHTML = html
  const imgs = Array.from(div.querySelectorAll(`img`))
  const mediaIds: string[] = []
  for (const img of imgs) {
    const src = img.getAttribute(`src`) || ``
    if (!src || /mmbiz\.qpic\.cn|mmbiz\.qlogo\.cn/.test(src))
      continue
    try {
      const resp = await fetch(src)
      const blob = await resp.blob()
      const file = new File([blob], `image.jpg`, { type: blob.type || `image/jpeg` })
      const { url, media_id } = await uploadContentImage(file) as any
      if (url)
        img.setAttribute(`src`, url)
      if (media_id)
        mediaIds.push(media_id)
    }
    catch (e) {
      console.warn(`上传内容图片失败`, e)
    }
  }
  return { html: div.innerHTML, mediaIds }
}

async function saveDraft() {
  try {
    saving.value = true
    await store.formatContent()
    store.editorRefresh()
    let html = store.output
    const replaced = await replaceImagesWithWeChatUrlsAndCollectMedia(html)
    html = replaced.html
    const mediaIds = replaced.mediaIds.slice(0, 20)
    const { title, digest } = extractTitleAndDigest(html)
    const article: any = {
      article_type: 'newspic',
      title,
      author: ``,
      digest,
      content: html,
      image_info: { image_list: mediaIds.map(id => ({ image_media_id: id })) },
    }
    const current = store.getPostById(store.currentPostId)
    if (current?.wxMediaId) {
      await draftUpdate({ media_id: current.wxMediaId, index: 0, articles: article })
      toast.success(`草稿已更新`)
      // 保存成功后打开发布设置弹窗
      publishDialogOpen.value = true
    }
    else {
      const resp: any = await draftAdd({ articles: [article] })
      const mediaId = resp?.media_id
      if (mediaId && current)
        current.wxMediaId = mediaId
      toast.success(`草稿已保存`)
      // 新增成功后也打开发布设置弹窗
      publishDialogOpen.value = true
    }
  }
  catch (e: any) {
    toast.error(`保存失败：${e?.message || e}`)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button :disabled="saving" variant="outline" @click="saveDraft">保存草稿</Button>
    <TooltipProvider :delay-duration="200">
      <Tooltip>
        <TooltipTrigger as-child>
          <span>
            <Button v-if="!store.isMobile" variant="outline" disabled>
              发布
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          受微信官方规则限制，个人认证的公众号无法通过 api 进行发布，请到官方平台发布草稿。地址：
          <a href="https://mp.weixin.qq.com/cgi-bin/appmsg" target="_blank" style="text-decoration: underline;">https://mp.weixin.qq.com/cgi-bin/appmsg</a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>

  <PublishSettingsDialog v-model:open="publishDialogOpen" />
</template>
