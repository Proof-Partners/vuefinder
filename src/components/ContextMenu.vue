<template>
  <ul ref="contextmenu" v-show="context.active" :style="context.positions" class="context-menu">
    <li class="item" v-for="(item) in filteredItems" :key="item.title">
      <template v-if="item.link">
        <a class="link" target="_blank" :href="item.link" :download="item.link"
          @click="app.emitter.emit('vf-contextmenu-hide')">
          <span>{{ item.title }}</span>
        </a>
      </template>
      <template v-else>
        <div class="action" @click="run(item)">
          <span>{{ item.title }}</span>
        </div>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, reactive, ref } from 'vue';
import { FEATURES } from "@/features.js";
import ModalNewFolder from "@/views/modals/ModalNewFolder.vue";
import ModalPreview from "@/views/modals/ModalPreview.vue";
import ModalArchive from "@/views/modals/ModalArchive.vue";
import ModalUnarchive from "@/views/modals/ModalUnarchive.vue";
import ModalRename from "@/views/modals/ModalRename.vue";
import ModalDelete from "@/views/modals/ModalDelete.vue";
import type { ServiceContainer } from '@/ServiceContainer';
import type { Item } from '@/composables/useData';

// TODO find out what Thing really is
type MenuItem = {
  readonly title: string;
  action: () => void;
  readonly link?: string;
  readonly key?: FEATURES;
}


const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n

const contextmenu = ref<HTMLElement | null>(null);
const selectedItems = ref<Item[]>([]);
const searchQuery = ref('');

const context = reactive({
  active: false,
  items: [] as MenuItem[],
  positions: {
    left: '0',
    top: '0'
  }
});

const filteredItems = computed(() => {
  return context.items.filter(item => item.key == null || app.features.includes(item.key))
});

app.emitter.on('vf-context-selected', (items: Item[]) => {
  selectedItems.value = items;
});

const menuItems: Record<string, MenuItem> = {
  newfolder: {
    key: FEATURES.NEW_FOLDER,
    get title() { return t('New Folder'); },
    action: () => app.modal.open(ModalNewFolder),
  },
  selectAll: {
    get title() { return t('Select All'); },
    action: () => app.dragSelect.value.selectAll(),
  },
  pinFolder: {
    get title() { return t('Pin Folder'); },
    action: () => {
      app.pinnedFolders = app.pinnedFolders.concat(selectedItems.value);
      app.storage.setStore('pinned-folders', app.pinnedFolders);
    },
  },

  unpinFolder: {
    get title() { return t('Unpin Folder'); },
    action: () => {
      app.pinnedFolders = app.pinnedFolders.filter(fav => !selectedItems.value.find(item => item.path === fav.path));
      app.storage.setStore('pinned-folders', app.pinnedFolders);
    },
  },
  delete: {
    key: FEATURES.DELETE,
    get title() { return t('Delete'); },
    action: () => {
      app.modal.open(ModalDelete, { items: selectedItems });
    },
  },
  refresh: {
    get title() { return t('Refresh'); },
    action: () => {
      app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter, path: app.fs.data.dirname } });
    },
  },
  preview: {
    key: FEATURES.PREVIEW,
    get title() { return t('Preview'); },
    action: () => app.modal.open(ModalPreview, { adapter: app.fs.adapter, item: selectedItems.value[0] }),
  },
  open: {
    get title() { return t('Open'); },
    action: () => {
      app.emitter.emit('vf-search-exit');
      app.emitter.emit('vf-fetch', {
        params: {
          q: 'index',
          adapter: app.fs.adapter,
          path: selectedItems.value[0].path
        }
      });
    },
  },
  openDir: {
    get title() { return t('Open containing folder'); },
    action: () => {
      const path = selectedItems.value[0].path.split('/').slice(0, -1).join('/');
      app.emitter.emit('vf-search-exit');
      app.emitter.emit('vf-fetch', {
        params: {
          q: 'index',
          adapter: app.fs.adapter,
          path,
        }
      });
    },
  },
  download: {
    key: FEATURES.DOWNLOAD,
    get link() { return app.requester.getDownloadUrl(app.fs.adapter.value, selectedItems.value[0]); },
    get title() { return t('Download'); },
    action: () => {
    },
  },
  archive: {
    key: FEATURES.ARCHIVE,
    get title() { return t('Archive'); },
    action: () => app.modal.open(ModalArchive, { items: selectedItems }),
  },
  unarchive: {
    key: FEATURES.UNARCHIVE,
    get title() { return t('Unarchive'); },
    action: () => app.modal.open(ModalUnarchive, { items: selectedItems }),
  },
  rename: {
    key: FEATURES.RENAME,
    get title() { return t('Rename'); },
    action: () => app.modal.open(ModalRename, { items: selectedItems }),
  }
};

const run = (item: MenuItem) => {
  app.emitter.emit('vf-contextmenu-hide');
  item.action();
};


app.emitter.on('vf-search-query', ({ newQuery }) => {
  searchQuery.value = newQuery;
});

app.emitter.on('vf-contextmenu-show', ({ event, items, target }: { event: MouseEvent, items: Item[], target?: Item }) => {
  context.items = [];

  if (searchQuery.value) {
    if (!target) {
      return;
    }
    context.items.push(menuItems.openDir);
    app.emitter.emit('vf-context-selected', [target]);
    // console.log('search item selected');

  } else if (!target) {
    context.items.push(menuItems.refresh);
    context.items.push(menuItems.selectAll);
    context.items.push(menuItems.newfolder);
    app.emitter.emit('vf-context-selected', []);
    // console.log('no files selected');
  } else if (items.length > 1 && items.some((el: Item) => el.path === target.path)) {
    context.items.push(menuItems.refresh);
    context.items.push(menuItems.archive);
    context.items.push(menuItems.delete);
    app.emitter.emit('vf-context-selected', items);
    // console.log(items.length + ' selected (more than 1 item.)');
  } else {
    if (target.type === 'dir') {
      context.items.push(menuItems.open);
      if (app.pinnedFolders.findIndex((item) => item.path === target.path) !== -1) {
        context.items.push(menuItems.unpinFolder);
      } else {
        context.items.push(menuItems.pinFolder);
      }
    } else {
      context.items.push(menuItems.preview);
      context.items.push(menuItems.download);
    }
    context.items.push(menuItems.rename);

    if (target.mime_type === 'application/zip') {
      context.items.push(menuItems.unarchive);
    } else {
      context.items.push(menuItems.archive);
    }
    context.items.push(menuItems.delete);
    app.emitter.emit('vf-context-selected', [target]);
    // console.log(target.type + ' is selected');
  }
  showContextMenu(event);
})

app.emitter.on('vf-contextmenu-hide', () => {
  context.active = false;
})

const showContextMenu = (event: MouseEvent) => {

  const rootContainer = app.root.value!.getBoundingClientRect();
  const areaContainer = app.dragSelect.value.area.value!.getBoundingClientRect();

  let left = event.clientX - rootContainer.left;
  let top = event.clientY - rootContainer.top;

  context.active = true;
  // wait for the next tick to get the actual size of the context menu
  nextTick(() => {
    // get the actual size of the context menu
    const menuContainer = contextmenu.value?.getBoundingClientRect();

    const menuHeight = menuContainer?.height ?? 0;
    const menuWidth = menuContainer?.width ?? 0;

    // check if the context menu is out of the container area
    left = (areaContainer.right - event.pageX + window.scrollX) < menuWidth ? left - menuWidth : left;
    top = (areaContainer.bottom - event.pageY + window.scrollY) < menuHeight ? top - menuHeight : top;

    context.positions = { left: `${left}px`, top: `${top}px` };
  });
};

</script>

<style lang="postcss" scoped>
.context-menu {
  @apply z-30 absolute text-xs bg-neutral-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-neutral-400 dark:border-gray-600 shadow rounded-sm select-none;

  & .item {
    @apply cursor-pointer hover:bg-neutral-200 dark:hover:bg-gray-700;
  }

  & .link {
    @apply block pl-2 pr-3 py-2;
  }

  & .action {
    @apply pl-2 pr-3 py-1.5;
  }
}
</style>