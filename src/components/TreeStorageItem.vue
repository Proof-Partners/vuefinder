<template>
  <div @click="selectOrToggle(storage)" class="header">
    <div :class="['info', { active: storage === app.fs.adapter.value }]">
      <div :class="['icon', { active: storage === app.fs.adapter.value }]">
        <StorageSVG />
      </div>
      <div>{{ storage }}</div>
    </div>

    <div class="loader" @click.stop="showSubFolders = !showSubFolders">
      <FolderLoaderIndicator :adapter="storage" :path="`${storage}://`" v-model="showSubFolders" />
    </div>
  </div>
  <TreeSubfolderList :adapter="storage" :path="`${storage}://`" v-show="showSubFolders" class="subfolder" />
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';

import StorageSVG from "./icons/storage.svg";
import FolderLoaderIndicator from "./FolderLoaderIndicator.vue";
import TreeSubfolderList from "./TreeSubfolderList.vue";
import type { ServiceContainer } from '@/ServiceContainer';

// TODO remove state?
const app = inject<ServiceContainer>('ServiceContainer')!;
const { setStore } = app.storage;
const showSubFolders = ref(false);

defineProps<{ storage: string }>();

/**
 * If the storage is active the visibilty of the subfolders gets toggled, otherwise the storage will become active 
 * @param storage {string}
 */
function selectOrToggle(storage: string) {
  if (storage === app.fs.adapter.value) {
    // toggle list of subfolders
    showSubFolders.value = !showSubFolders.value
  } else {
    // select storage
    app.emitter.emit('vf-search-exit');
    app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: storage } });
    setStore('adapter', storage);
  }
}

</script>

<style lang="postcss" scoped>
.header {
  @apply p-1 py-1.5 uppercase font-bold text-gray-400 dark:text-gray-500 text-xs flex justify-between bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 cursor-pointer;
}

.info {
  @apply flex flex-1 space-x-1 items-center;

  &.active {
    @apply text-gray-700/80 dark:text-gray-300/80 font-bold;
  }
}


.icon {
  @apply h-5 w-5 shrink-0;

  &.active {
    @apply text-sky-500 dark:text-slate-300;
  }
}

.loader {
  @apply px-1;
}

.subfolder {
  @apply overflow-x-auto my-1;
}
</style>