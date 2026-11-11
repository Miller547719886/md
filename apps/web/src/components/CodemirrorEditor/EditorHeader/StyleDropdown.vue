<script setup lang="ts">
import { legendOptions } from '@md/shared/configs'
import { useStore } from '@/stores'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const store = useStore()

const { legend } = storeToRefs(store)

const { resetStyleConfirm, legendChanged } = store
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      样式
    </MenubarSubTrigger>
    <MenubarSubContent class="w-56">
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem divided @click="resetStyleConfirm">
        重置
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger> 样式 </MenubarTrigger>
    <MenubarContent class="w-56" align="start">
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem divided @click="resetStyleConfirm">
        重置
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
