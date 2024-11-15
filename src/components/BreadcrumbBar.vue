<template>
  <div class="breadcrumb">
    <span :title="t('Toggle Tree View')">
      <ListTreeSVG @click="toggleTreeView" :class="['toggle-tree', { active: app.showTreeView }]" />
    </span>

    <span :title="t('Go up a directory')">
      <GoUpSVG @dragover="handleDragOver($event)" @dragleave="handleDragLeave($event)" @drop="handleDropZone($event)"
        @click="handleGoUp" :class="['go-up', app.fs.isGoUpAvailable() ? 'active' : 'inactive']" />
    </span>

    <span :title="t('Refresh')" v-if="!app.fs.loading">
      <RefreshSVG @click="handleRefresh" />
    </span>
    <span :title="t('Cancel')" v-else>
      <CloseSVG @click="app.emitter.emit('vf-fetch-abort')" />
    </span>

    <div v-show="!app.fs.searchMode" @click.self="enterSearchMode" class="group search-container">
      <div>
        <HomeSVG @dragover="handleDragOver($event)" @dragleave="handleDragLeave($event)"
          @drop="handleDropZone($event, -1)"
          @click="app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter } })" />
      </div>

      <div class="list">
        <div v-if="app.fs.hiddenBreadcrumbs.value.length" class="hidden-list" v-click-outside="handleClickOutside">
          <div class="separator">/</div>
          <div class="relative">
            <span @dragenter="app.fs.toggleHiddenBreadcrumbs(true)" @click="app.fs.toggleHiddenBreadcrumbs()"
              class="hidden-toggle">
              <DotsSVG class="hidden-toggle-icon" />
            </span>
          </div>
        </div>
      </div>

      <div ref="breadcrumbContainer" class="visible-list" @click.self="enterSearchMode">
        <div v-for="(item, index) in app.fs.breadcrumbs.value" :key="index">
          <span class="separator">/</span>
          <span @dragover="(index === app.fs.breadcrumbs.value.length - 1) || handleDragOver($event)"
            @dragleave="(index === app.fs.breadcrumbs.value.length - 1) || handleDragLeave($event)"
            @drop="(index === app.fs.breadcrumbs.value.length - 1) || handleDropZone($event, index)" class="item"
            :title="item.basename"
            @click="app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter, path: item.path } })">{{
              item.name }}</span>
        </div>
      </div>

      <LoadingSVG v-if="app.loadingIndicator === 'circular' && app.fs.loading" />
    </div>
    <div v-show="app.fs.searchMode" class="search-mode">
      <div>
        <SearchSVG />
      </div>
      <input ref="searchInput" @keydown.esc="exitSearchMode" @blur="handleBlur" v-model="query"
        :placeholder="t('Search anything..')" class="search-input" type="text">
      <ExitSVG @click="exitSearchMode" />
    </div>

    <div v-show="app.fs.showHiddenBreadcrumbs" class="hidden-dropdown">
      <div v-for="(item, index) in app.fs.hiddenBreadcrumbs.value" :key="index" @dragover="handleDragOver($event)"
        @dragleave="handleDragLeave($event)" @drop="handleHiddenBreadcrumbDropZone($event, index)"
        @click="handleHiddenBreadcrumbsClick(item)" class="hidden-item">
        <div class="hidden-item-content">
          <span>
            <FolderSVG class="hidden-item-icon" />
          </span> <span class="hidden-item-text">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import useDebouncedRef from '@/composables/useDebouncedRef';
import type { Item } from '@/composables/useData';
import { FEATURES } from "@/features.js";
import ModalMove from "@/views/modals/ModalMove.vue";
import RefreshSVG from "@/icons/refresh.svg";
import GoUpSVG from "@/icons/go_up.svg";
import CloseSVG from "@/icons/close.svg";
import HomeSVG from "@/icons/home.svg";
import SearchSVG from "@/icons/search.svg";
import LoadingSVG from "@/icons/loading.svg";
import ExitSVG from "@/icons/exit.svg";
import FolderSVG from '@/icons/folder.svg';
import ListTreeSVG from '@/icons/list_tree.svg';
import DotsSVG from '@/icons/dots.svg';
import type { ServiceContainer } from '@/ServiceContainer.js';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;
const ds = app.dragSelect;
const { setStore } = app.storage;

// dynamic shown items calculation for breadcrumbs

const breadcrumbContainer = useTemplateRef('breadcrumbContainer');
const breadcrumbContainerWidth = useDebouncedRef(0, 100);

watch(breadcrumbContainerWidth, (width) => {
  const { children } = breadcrumbContainer.value!;

  let totalWidth = 0;
  let count = 0;
  const max = 5;
  const min = 1;

  app.fs.limitBreadcrumbItems(max);
  nextTick(() => {
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as HTMLElement;
      if (totalWidth + child.offsetWidth > width - 40) {
        break;
      }
      totalWidth += child.offsetWidth;
      count++;
    }

    count = Math.min(Math.max(count, min), max)

    app.fs.limitBreadcrumbItems(count);
  });
});

const updateContainerWidth = () => {
  breadcrumbContainerWidth.value = breadcrumbContainer.value!.offsetWidth;
}

const resizeObserver = ref<ResizeObserver | null>(null);
onMounted(() => {
  resizeObserver.value = new ResizeObserver(updateContainerWidth);
  resizeObserver.value.observe(breadcrumbContainer.value!);
});
onUnmounted(() => {
  resizeObserver.value?.disconnect();
});

const handleDropZoneFor = (src: Item[], offset: number) => {
  return (e: DragEvent, index?: number) => {
    e.preventDefault();

    ds.value.isDraggingRef.value = false;
    handleDragLeave(e);

    // TODO find out what is the type of the data
    const draggedItems: { storage: string }[] = JSON.parse(e.dataTransfer?.getData('items') ?? '');

    if (draggedItems.find((item) => item.storage !== app.fs.adapter.value)) {
      alert('Moving items between different storages is not supported yet.');
      return;
    }

    index ??= src.length - offset;
    app.modal.open(ModalMove, {
      items: {
        from: draggedItems,
        to: src[index] ?? {
          path: (app.fs.adapter + '://')
        },
      },
    });
  }
}

const handleHiddenBreadcrumbDropZone = handleDropZoneFor(app.fs.hiddenBreadcrumbs.value, 1);

const handleDropZone = handleDropZoneFor(app.fs.breadcrumbs.value, 2);

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();

  if (app.fs.isGoUpAvailable()) {
    e.dataTransfer!.dropEffect = 'copy';
    (e.currentTarget as HTMLElement).classList.add('bg-blue-200', 'dark:bg-slate-600');
  } else {
    e.dataTransfer!.dropEffect = 'none';
    e.dataTransfer!.effectAllowed = 'none';
  }
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();

  // (e.currentTarget as HTMLElement).classList.remove('bg-blue-200', 'dark:bg-slate-600');

  if (app.fs.isGoUpAvailable()) {
    (e.currentTarget as HTMLElement).classList.remove('bg-blue-200', 'dark:bg-slate-600');
  }
};

const handleRefresh = () => {
  exitSearchMode();

  app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter, path: app.fs.data.dirname } });
};

const handleGoUp = () => {
  exitSearchMode();

  if (app.fs.isGoUpAvailable()) {
    app.emitter.emit('vf-fetch', {
      params: {
        q: 'index',
        adapter: app.fs.adapter,
        path: app.fs.parentFolderPath
      }
    })
  }
};

const handleHiddenBreadcrumbsClick = (item: Item) => {
  app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter, path: item.path } });
  app.fs.toggleHiddenBreadcrumbs(false);
}

const handleClickOutside = () => {
  app.fs.toggleHiddenBreadcrumbs(false);
}

// TODO removed, because it doesn't seem to do anything?
// const vClickOutside = {
//   mounted(el, binding, vnode, prevVnode) {
//     el.clickOutsideEvent = (event: Event) => {
//       // here I check that click was outside the el and his children
//       if (!(el === event.target || el.contains(event.target))) {
//         // and if it did, call method provided in attribute value
//         binding.value();
//       }
//     };
//     document.body.addEventListener('click', el.clickOutsideEvent)
//   },
//   beforeUnmount(el, binding, vnode, prevVnode) {
//     document.body.removeEventListener('click', el.clickOutsideEvent)
//   }
// };

// FIXME seems like this is in the wrong place
/**
 * Tree View
 */
const toggleTreeView = () => {
  app.showTreeView = !app.showTreeView;
}
watch(() => app.showTreeView, (newShowTreeView, oldValue) => {
  if (newShowTreeView !== oldValue) {
    setStore('show-tree-view', newShowTreeView);
  }
});

// FIXME seems like this is in the wrong place
/**
 *
 * Search
 */
const searchInput = useTemplateRef('searchInput');

const enterSearchMode = () => {
  if (!app.features.includes(FEATURES.SEARCH)) {
    return;
  }
  app.fs.searchMode = true;
}

const query = useDebouncedRef('', 400);

watch(query, newQuery => {
  app.emitter.emit('vf-toast-clear');
  app.emitter.emit('vf-search-query', { newQuery });
});

watch(() => app.fs.searchMode, (newSearchMode) => {
  if (newSearchMode) {
    nextTick(() => searchInput.value!.focus());
  }
});

const exitSearchMode = () => {
  app.fs.searchMode = false;
  query.value = '';
}

app.emitter.on('vf-search-exit', () => {
  exitSearchMode();
});


const handleBlur = () => {
  if (query.value === '') {
    exitSearchMode();
  }
}
</script>

<style lang="postcss" scoped>
.breadcrumb {
  @apply space-x-0.5 flex p-1.5 bg-neutral-100 dark:bg-gray-800 border-t border-b border-neutral-300 dark:border-gray-700/50 items-center select-none text-sm grow-0;

  & .toggle-tree {
    @apply h-6 w-6 p-0.5 rounded cursor-pointer text-slate-700;

    &.active {
      @apply bg-gray-300 dark:bg-gray-700;
    }
  }

  & .go-up {
    &.active {
      @apply text-slate-700 hover:bg-neutral-300 dark:text-neutral-200 dark:hover:bg-gray-700 cursor-pointer;
    }

    &.inactive {
      @apply text-gray-400 dark:text-neutral-500;
    }
  }

  & .search-container {
    @apply flex bg-white dark:bg-gray-700 items-center rounded p-1 ml-2 w-full overflow-hidden;
  }

  & .list {
    @apply flex leading-6;
  }

  & .hidden-list {
    @apply flex;
  }

  & .separator {
    @apply text-neutral-300 dark:text-gray-600 mx-0.5;
  }

  & .hidden-toggle {
    @apply text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded cursor-pointer;
  }

  & .hidden-toggle-icon {
    @apply px-1 pointer-events-none;
  }

  & .visible-list {
    @apply flex leading-6 w-full overflow-hidden;
  }

  & .item {
    @apply px-1.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded cursor-pointer whitespace-nowrap;
  }

  & .search-mode {
    @apply relative flex bg-white dark:bg-gray-700 justify-between items-center rounded p-1 ml-2 w-full;
  }

  & .search-input {
    @apply w-full pb-0 px-1 border-0 text-base ring-0 outline-0 text-gray-600 focus:ring-transparent focus:border-transparent dark:focus:ring-transparent dark:focus:border-transparent dark:text-gray-300 bg-transparent;
  }

  & .hidden-dropdown {
    @apply z-30 absolute top-[65px] md:top-[75px] left-[90px] rounded -mx-1.5 mt-1 bg-neutral-50 dark:bg-gray-800 max-w-80 shadow overflow-y-auto text-gray-700 dark:text-gray-200 border border-neutral-300 dark:border-gray-600;
  }

  & .hidden-item {
    @apply px-2 py-0.5 hover:bg-gray-400/20 cursor-pointer items-center whitespace-nowrap;
  }

  & .hidden-item-content {
    @apply flex pointer-events-none;
  }
}
</style>