<template>
  <ul ref="parentSubfolderList" class="container">
    <li v-for="(item) in treeSubFolders" :key="item.path" class="item">
      <div class="item-content">
        <div class="item-toggle" @click="showSubFolders[item.path] = !showSubFolders[item.path]">
          <FolderLoaderIndicator :adapter="adapter" :path="item.path" v-model="showSubFolders[item.path]" />
        </div>
        <div class="item-link" :title="item.path"
          @click="app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: props.adapter, path: item.path } })">
          <div class="item-icon">
            <OpenFolderSVG v-if="app.fs.path.value === item.path" />
            <FolderSVG v-else />
          </div>
          <div :class="['item-text', { active: app.fs.path.value === item.path }]">
            {{ item.basename }}
          </div>
        </div>
      </div>
      <div class="subfolder">
        <TreeSubfolderList :adapter="props.adapter" :path="item.path" v-show="showSubFolders[item.path]" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, useTemplateRef } from 'vue';

import FolderSVG from "@/icons/folder.svg";
import OpenFolderSVG from "@/icons/open_folder.svg";
import FolderLoaderIndicator from "./FolderLoaderIndicator.vue";
import { OverlayScrollbars } from "overlayscrollbars";
import type { ServiceContainer } from '@/ServiceContainer';

const app = inject<ServiceContainer>('ServiceContainer')!;

const showSubFolders = ref<Record<string, boolean>>({});

const props = defineProps<{ adapter: string, path: string }>();
const parentSubfolderList = useTemplateRef('parentSubfolderList');

onMounted(() => {
  // only initialize overlay scrollbars for the root folder
  if (props.path === `${props.adapter}://`) {
    OverlayScrollbars(parentSubfolderList.value!, {
      scrollbars: {
        theme: 'vf-theme-dark dark:vf-theme-light',
      },
    });
  }
});
const treeSubFolders = computed(() => {
  return app.treeViewData.find(e => e.path === props.path)?.folders || [];
})
</script>

<style lang="postcss" scoped>
.container {
  @apply block;
}

.item {
  @apply flex flex-col space-x-0.5 py-0.5 text-sm;
}

.item-content {
  @apply flex hover:text-sky-700 dark:hover:text-sky-200/50 rounded;
}

.item-toggle {
  @apply h-5 w-5 shrink-0;
}

.item-link {
  @apply flex cursor-pointer;
}

.item-icon {
  @apply h-5 w-5 shrink-0;
}

.item-text {
  @apply text-nowrap pr-4;

  &.active {
    @apply underline decoration-blue-300 dark:decoration-gray-400;
  }
}

.subfolder {
  @apply pl-4;
}
</style>
