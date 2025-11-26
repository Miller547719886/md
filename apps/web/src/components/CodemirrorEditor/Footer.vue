<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from '@/stores'

const store = useStore()
const { readingTime } = storeToRefs(store)

const tips = [
  `强调：ctrl+b（windows）/ cmd+b（macOS）`,
  `斜体：ctrl+i（windows）/ cmd+i（macOS）`,
  `插入链接：ctrl+k（windows）/ cmd+k（macOS）`,
  `行内标签：ctrl+e（windows）/ cmd+e（macOS）`,
  `标题级别：ctrl+h（windows）/ cmd+h（macOS）`,
  `无序列表：ctrl+u（windows）/ cmd+u（macOS）`,
  `有序列表：ctrl+o（windows）/ cmd+o（macOS）`,
  `alt+shift+f 一键格式化`,
]

const marqueeWrapRef = ref<HTMLElement>()
const marqueeTrackRef = ref<HTMLElement>()
let stopTimer: ReturnType<typeof setTimeout> | null = null

const SPEED_PX_PER_SEC = 30 // 放慢速度：每秒 30px
const RESTART_DELAY = 1000 // 停留 1 秒再重播

function startMarquee() {
  const wrap = marqueeWrapRef.value
  const track = marqueeTrackRef.value
  if (!wrap || !track)
    return

  const wrapWidth = wrap.clientWidth
  const trackWidth = track.scrollWidth

  const startX = wrapWidth
  const endX = Math.min(wrapWidth - trackWidth, 0) // 最后一个字对齐右边缘
  const distance = startX - endX
  const duration = distance / SPEED_PX_PER_SEC

  track.style.transition = `none`
  track.style.transform = `translateX(${startX}px)`

  // 触发重绘
  void track.offsetWidth

  track.style.transition = `transform ${duration}s linear`
  track.style.transform = `translateX(${endX}px)`

  const onEnd = () => {
    track.removeEventListener(`transitionend`, onEnd)
    stopTimer && clearTimeout(stopTimer)
    stopTimer = setTimeout(() => {
      startMarquee()
    }, RESTART_DELAY)
  }

  track.addEventListener(`transitionend`, onEnd)
}

onMounted(() => {
  nextTick(() => {
    startMarquee()
  })
})

onBeforeUnmount(() => {
  stopTimer && clearTimeout(stopTimer)
})
</script>

<template>
  <footer
    class="flex select-none items-center justify-between px-5 py-2 text-xs gap-4"
  >
    <div class="flex-1" />
    <div class="text-muted-foreground text-xs whitespace-nowrap">
      使用快捷键，写作效率更高 ^w^
    </div>

    <div
      ref="marqueeWrapRef"
      class="tips-marquee flex-1 text-center text-muted-foreground overflow-hidden whitespace-nowrap"
    >
      <span ref="marqueeTrackRef" class="tips-track">
        <template v-for="(tip, index) in tips" :key="`${tip}-${index}`">
          <span class="tip-item">{{ tip }}</span>
          <span v-if="index !== tips.length - 1" class="tip-separator">｜</span>
        </template>
      </span>
    </div>
    <div class="flex-1 text-right space-x-2">
      <span> {{ readingTime.words }} 个词 </span>
      <span> {{ readingTime.chars }} 个字符 </span>
      <span> 阅读大约需 {{ readingTime.minutes }} 分钟 </span>
    </div>
  </footer>
</template>

<style scoped lang="less">
.tips-marquee {
  position: relative;
}

.tips-track {
  display: inline-block;
  will-change: transform;
}

.tip-item {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.tip-separator {
  margin: 0 8px;
  opacity: 0.65;
}
</style>
