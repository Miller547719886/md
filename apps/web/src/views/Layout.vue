<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const links = [
  { to: `/`, label: `首页` },
  { to: `/assets`, label: `素材库` },
  { to: `/drafts`, label: `草稿箱` },
  { to: `/publishes`, label: `发表记录` },
]
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <h1 class="brand">
        生涯重塑
      </h1>
      <nav>
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="nav" :class="{ active: route.path === l.to }">
          {{ l.label }}
        </RouterLink>
      </nav>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.sidebar {
  width: 220px;
  padding: 16px;
  border-right: 1px solid #eee;
}
.brand {
  font-size: 16px;
  margin: 0 0 12px 0;
}
.nav {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
}
.nav.active,
.nav:hover {
  background: #f4f5f7;
}
.content {
  flex: 1;
  overflow: auto;
}
</style>
