<script setup lang="ts">
import {
  legendOptions,
  widthOptions,
} from '@md/shared/configs'
import { Moon, Sun, X } from 'lucide-vue-next'
import { useStore } from '@/stores'

const store = useStore()

// 控制是否启用动画
const enableAnimation = ref(false)

// 监听 RightSlider 开关状态变化
watch(() => store.isOpenRightSlider, () => {
  if (store.isMobile) {
    // 在移动端，用户操作时启用动画
    enableAnimation.value = true
  }
})

// 监听设备类型变化，重置动画状态
watch(() => store.isMobile, () => {
  enableAnimation.value = false
})

const { isDark } = storeToRefs(store)

const isOpen = ref(false)

const addPostInputVal = ref(``)

watch(isOpen, () => {
  if (isOpen.value) {
    addPostInputVal.value = ``
  }
})
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="store.isMobile && store.isOpenRightSlider"
    class="fixed inset-0 bg-black/50 z-40"
    @click="store.isOpenRightSlider = false"
  />

  <div
    class="overflow-hidden mobile-right-drawer"
    :class="{
      // 移动端样式
      'fixed top-0 right-0 w-full h-full z-55 bg-background border-l shadow-lg': store.isMobile,
      'animate': store.isMobile && enableAnimation,
      // 桌面端样式
      'border-l-2 order-2 border-gray/20 bg-white transition-width duration-300 dark:bg-[#191919]': !store.isMobile,
      'w-100': !store.isMobile && store.isOpenRightSlider,
      'w-0 border-l-0': !store.isMobile && !store.isOpenRightSlider,
    }"
    :style="{
      transform: store.isMobile ? (store.isOpenRightSlider ? 'translateX(0)' : 'translateX(100%)') : 'none',
    }"
  >
    <div
      class="space-y-4 h-full overflow-auto p-4"
      :class="{
        // 移动端不需要额外的transform
        'pt-0': store.isMobile,
        // 桌面端保持原有的动画
        'transition-transform': !store.isMobile,
        'translate-x-0': !store.isMobile && store.isOpenRightSlider,
        'translate-x-full': !store.isMobile && !store.isOpenRightSlider,
      }"
    >
      <!-- 移动端标题栏 -->
      <div v-if="store.isMobile" class="sticky top-0 z-10 flex items-center justify-between -mx-4 px-4 py-3 border-b mb-4 bg-background">
        <h2 class="text-lg font-semibold">
          样式设置
        </h2>
        <Button variant="ghost" size="sm" @click="store.isOpenRightSlider = false">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="space-y-2">
        <h2>图注格式</h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in legendOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': store.legend === value,
            }" @click="store.legendChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <h2>AI 工具箱</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': store.showAIToolbox,
            }" @click="!store.showAIToolbox && store.aiToolboxChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !store.showAIToolbox,
            }" @click="store.showAIToolbox && store.aiToolboxChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>微信外链转底部引用</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': store.isCiteStatus,
            }" @click="!store.isCiteStatus && store.citeStatusChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !store.isCiteStatus,
            }" @click="store.isCiteStatus && store.citeStatusChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>编辑区位置</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': store.isEditOnLeft,
            }" @click="!store.isEditOnLeft && store.toggleEditOnLeft()"
          >
            左侧
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !store.isEditOnLeft,
            }" @click="store.isEditOnLeft && store.toggleEditOnLeft()"
          >
            右侧
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>预览模式</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in widthOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': store.previewWidth === value,
            }" @click="store.previewWidthChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>模式</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isDark,
            }" @click="store.toggleDark(false)"
          >
            <Sun class="h-4 w-4" />
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isDark,
            }" @click="store.toggleDark(true)"
          >
            <Moon class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>样式配置</h2>
        <Button variant="destructive" @click="store.resetStyleConfirm">
          重置
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移动端右侧栏动画 - 只有添加了 animate 类才启用 */
.mobile-right-drawer.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
