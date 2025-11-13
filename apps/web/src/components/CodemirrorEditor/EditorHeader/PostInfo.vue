<script setup lang="ts">
import DraftSettingsDialog from './DraftSettingsDialog.vue'
import PublishSettingsDialog from './PublishSettingsDialog.vue'
import { useStore } from '@/stores'
import { toast } from '@/utils/toast'

const store = useStore()
const draftDialogOpen = ref(false)
const publishDialogOpen = ref(false)

function saveDraft() { draftDialogOpen.value = true }
</script>

<template>
  <div class="flex items-center gap-2">
    <Button variant="outline" @click="saveDraft">保存草稿</Button>
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

  <DraftSettingsDialog v-model:open="draftDialogOpen" />
  <PublishSettingsDialog v-model:open="publishDialogOpen" />
</template>
