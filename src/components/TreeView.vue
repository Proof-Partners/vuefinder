<template>
  <div @click="app.showTreeView = !app.showTreeView" :class="['overlay', app.showTreeView ? 'backdrop' : 'hidden']">
  </div>
  <div :style="app.showTreeView ? `min-width:100px;max-width:75%; width: ${treeViewWidth}px` : 'width: 0'"
    class="container">
    <div ref="treeViewScrollElement" class="scroll">
      <div class="header">
        <div @click="pinnedFoldersOpened = !pinnedFoldersOpened" class="pinned-toggle">
          <div class="pinned-label">
            <PinSVG class="pin-icon" />
            <div class="pin-text text-nowrap">{{ t('Pinned Folders') }}</div>
          </div>
          <FolderIndicator v-model="pinnedFoldersOpened" />
        </div>
        <ul class="pinned-list" v-if="pinnedFoldersOpened">
          <li v-for="favorite in app.pinnedFolders" class="pinned-item" :key="favorite.path">
            <div class="pinned-folder"
              @click="app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: favorite.storage, path: favorite.path } })">
              <FolderSVG class="folder-icon" v-if="app.fs.path.value !== favorite.path" />
              <OpenFolderSVG class="open-folder-icon" v-if="app.fs.path.value === favorite.path" />
              <div :title="favorite.path"
                :class="['folder-name', 'text-nowrap', { active: app.fs.path.value === favorite.path }]">
                {{ favorite.basename }}
              </div>
            </div>
            <div class="remove-favorite" @click="removeFavorite(favorite)">
              <XBoxSVG class="remove-icon" />
            </div>
          </li>
          <li v-if="!app.pinnedFolders.length">
            <div class="no-pinned">{{ t('No folders pinned') }}</div>
          </li>
        </ul>
      </div>

      <div class="storage" v-for="storage in app.fs.data.storages" :key="storage">
        <TreeStorageItem :storage="storage" />
      </div>
    </div>
    <div @mousedown="handleMouseDown" :class="app.showTreeView ? '' : ''" class="resize-handle">
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, useTemplateRef, watch } from 'vue';
import FolderSVG from '@/icons/folder.svg';
import OpenFolderSVG from '@/icons/open_folder.svg';
import PinSVG from '@/icons/pin.svg';
import XBoxSVG from '@/icons/x_box.svg';

import { OverlayScrollbars } from 'overlayscrollbars';
import TreeStorageItem from "./TreeStorageItem.vue";
import upsert from '@/utils/upsert';
import FolderIndicator from "./FolderIndicator.vue";
import type { ServiceContainer } from '@/ServiceContainer';
import type { Item } from '@/composables/useData';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;
const { getStore, setStore } = app.storage;

const treeViewWidth = ref(190);
const pinnedFoldersOpened = ref(getStore('pinned-folders-opened', true)!);
watch(pinnedFoldersOpened, (value) => setStore('pinned-folders-opened', value));

const removeFavorite = (item: Item) => {
  app.pinnedFolders = app.pinnedFolders.filter(fav => fav.path !== item.path);
  app.storage.setStore('pinned-folders', app.pinnedFolders);
}

const handleMouseDown = (e: MouseEvent) => {
  const startX = e.clientX;
  const element = (e.target as HTMLElement).parentElement!;
  const startWidth = element.getBoundingClientRect().width;

  // start of event remove transition-[width] and add transition-none
  element.classList.remove('transition-[width]');
  element.classList.add('transition-none');

  const handleMouseMove = (e: MouseEvent) => {
    treeViewWidth.value = startWidth + e.clientX - startX;

    if (treeViewWidth.value < 50) {
      treeViewWidth.value = 0;
      app.showTreeView = false;
    }
    if (treeViewWidth.value > 50) {
      app.showTreeView = true;
    }
  };

  const handleMouseUp = () => {
    // get the actual width of the element, update the treeViewWidth
    const elementData = element.getBoundingClientRect();
    treeViewWidth.value = elementData.width;
    // end of event add transition-[width] and remove transition-none
    element.classList.add('transition-[width]');
    element.classList.remove('transition-none');
    // remove event listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // add event listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

}
const treeViewScrollElement = useTemplateRef('treeViewScrollElement');

onMounted(() => {
  OverlayScrollbars(treeViewScrollElement.value!, {
    overflow: {
      x: 'hidden',
    },
    scrollbars: {
      theme: 'vf-theme-dark dark:vf-theme-light',
    },
  });
});

// watch for changes in the fs.data
// update the treeViewData
watch(app.fs.data, (newValue) => {
  const folders = newValue.files.filter(e => e.type === 'dir');

  upsert(app.treeViewData, {
    path: app.fs.path.value,
    folders: folders.map((item) => ({
      adapter: item.storage,
      path: item.path,
      basename: item.basename
    })),
  });
});

</script>

<style lang="postcss" scoped>
.overlay {
  @apply w-full h-full bg-gray-300/10 dark:bg-gray-700/10 z-[1];
}

.backdrop {
  @apply backdrop-blur-sm absolute md:hidden;
}

.scroll {
  @apply h-full border-r dark:border-gray-600/50 pb-4;
}

.header {
  @apply sticky left-0 dark:border-gray-600;
}

.pinned-toggle {
  @apply pr-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 border-b p-1 py-1.5 uppercase font-bold text-gray-400 dark:text-gray-400 text-xs flex items-center justify-between cursor-pointer;
}

.pinned-label {
  @apply flex items-center space-x-1;
}

.pin-icon {
  @apply text-amber-600;
}

.pinned-list {
  @apply block my-1;
}

.pinned-item {
  @apply flex pl-2 py-0.5 text-sm justify-between pr-2;
}

.pinned-folder {
  @apply flex hover:text-sky-500 dark:hover:text-sky-200/50 rounded cursor-pointer;
}

.folder-icon {
  @apply h-5 w-5;
}

.open-folder-icon {
  @apply h-5 w-5;
}

.folder-name {
  @apply text-nowrap;

  &.active {
    @apply underline decoration-blue-300 dark:decoration-gray-400;
  }
}

.remove-favorite {
  @apply cursor-pointer;
}

.remove-icon {
  @apply p-0.5 text-gray-300 hover:text-gray-400 dark:text-gray-600 hover:dark:text-gray-400;
}

.no-pinned {
  @apply p-1 text-xs text-center;
}

.storage {
  @apply sticky left-0;
}

.resize-handle {
  @apply transition-colors ease-in-out duration-200 top-0 hover:bg-slate-600/10 dark:hover:bg-slate-300/10 w-1 h-full absolute -right-0.5 cursor-ew-resize;
}
</style>
