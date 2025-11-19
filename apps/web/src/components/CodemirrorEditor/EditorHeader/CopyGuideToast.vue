<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const emit = defineEmits([`goPaste`, `openGuide`])

function handleGoPaste() {
  emit(`goPaste`)
}

function handleOpenGuide() {
  emit(`openGuide`)
}
</script>

<template>
  <div
    class="flex w-full max-w-[380px] items-center justify-between gap-3 rounded-md border bg-background px-4 py-3 text-sm shadow-lg"
  >
    <div class="leading-relaxed">
      已复制渲染后的内容到剪贴板，可直接到公众号后台粘贴。
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs"
        @click.stop="handleGoPaste"
      >
        去粘贴
      </Button>
      <TooltipProvider :delay-duration="150">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground hover:bg-muted"
              @click.stop="handleOpenGuide"
            >
              ?
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top" :side-offset="4"
          >
            后续如何操作?
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
