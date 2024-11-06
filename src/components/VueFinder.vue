<template>
  <div class="vuefinder" ref="root" tabindex="0">
    <div :class="app.theme.actualValue">
      <div :class="['container', app.fullScreen ? 'is-fixed' : 'is-relative']"
        :style="!app.fullScreen ? `max-height: ${maxHeight}` : ''" @mousedown="app.emitter.emit('vf-contextmenu-hide')"
        @touchstart="app.emitter.emit('vf-contextmenu-hide')">
        <Toolbar />
        <Breadcrumb />
        <div class="content">
          <TreeView />
          <Explorer />
        </div>
        <Statusbar />
      </div>

      <Transition name="fade">
        <Component v-if="app.modal.visible" :is="app.modal.type" />
      </Transition>

      <ContextMenu />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, ref, watch } from 'vue';
import ServiceContainer from "../ServiceContainer.js";
import { useHotkeyActions } from "../composables/useHotkeyActions.js";

import Toolbar from '../components/Toolbar.vue';
import Breadcrumb from '../components/Breadcrumb.vue';
import Explorer from '../components/Explorer.vue';
import ContextMenu from '../components/ContextMenu.vue';
import Statusbar from '../components/Statusbar.vue';
import TreeView from '../components/TreeView.vue';

const emit = defineEmits(['select', 'update:path'])

const { id = 'vf', features = true, theme = 'system', maxHeight = '600px', maxFileSize = '10mb', pinnedFolders = [], loadingIndicator = 'circular', ...rest } = defineProps<{
  id?: string,
  request: string | object,
  persist?: boolean,
  path?: string,
  features?: boolean | string[],
  debug?: boolean,
  theme?: string,
  locale?: string,
  maxHeight?: string,
  maxFileSize: string,
  fullScreen?: boolean,
  showTreeView?: boolean,
  pinnedFolders?: string[],
  showThumbnails?: boolean, // was default = false
  selectButton?: object, // too complex to define
  onError?: Function, // should be an emit, no?
  loadingIndicator?: string,
}>();

// selectButton: {
//   type: Object,
//   default(rawProps) {
//     return {
//       active: false,
//       multiple: false,
//       click: (items) => {
//         // items is an array of selected items
//         // 
//       },
//       ...rawProps,
//     }
//   },
// },
// onError: {
//   type: Function,
//   default: null,
// },


// the object is passed to all components as props
const app = ServiceContainer({ id, features, theme, maxHeight, maxFileSize, pinnedFolders, loadingIndicator, ...rest }, inject('VueFinderOptions'));
provide('ServiceContainer', app);
const { setStore } = app.storage;

//  Define root element
const root = ref(null);
app.root = root;

// Define dragSelect object
const ds = app.dragSelect;

useHotkeyActions(app);

const updateItems = (data) => {
  Object.assign(app.fs.data, data);
  ds.clearSelection();
  ds.refreshSelection();
};

/** @type {AbortController} */
let controller;
app.emitter.on('vf-fetch-abort', () => {
  controller.abort();
  app.fs.loading = false;
});

// Fetch data
app.emitter.on('vf-fetch', ({ params, body = null, onSuccess = null, onError = null, noCloseModal = false }) => {
  if (['index', 'search'].includes(params.q)) {
    if (controller) {
      controller.abort();
    }
    app.fs.loading = true;
  }

  controller = new AbortController();
  const signal = controller.signal;
  app.requester.send({
    url: '',
    method: params.m || 'get',
    params,
    body,
    abortSignal: signal,
  }).then(data => {
    app.fs.adapter = data.adapter;
    if (app.persist) {
      app.fs.path = data.dirname;
      setStore('path', app.fs.path);
    }


    if (!noCloseModal) {
      app.modal.close();
    }
    updateItems(data);
    if (onSuccess) {
      onSuccess(data);
    }
  }).catch((e) => {
    console.error(e)
    if (onError) {
      onError(e);
    }
  }).finally(() => {
    if (['index', 'search'].includes(params.q)) {
      app.fs.loading = false;
    }
  });
});

/**
 * fetchPath fetches the items of the given path
 * if no path is given, the backend should return the root of the current adapter
 * @param path {string | undefined} example: 'media://public'
 */
function fetchPath(path) {
  let pathExists = {};

  if (path && path.includes("://")) {
    pathExists = {
      adapter: path.split("://")[0],
      path
    };
  }

  app.emitter.emit('vf-fetch', {
    params: { q: 'index', adapter: app.fs.adapter, ...pathExists },
    onError: rest.onError ?? ((e) => {
      if (e.message) {
        app.emitter.emit('vf-toast-push', { label: e.message, type: 'error' })
      }
    })
  });
}

// fetch initial data
onMounted(() => {
  // app.fs.adapter can be null at first, until we get the adapter list it will be the first one from response
  // later we can set default adapter from a prop value

  // if there is a path coming from the prop, we should use it.
  fetchPath(app.fs.path)

  // We re-fetch the data if the path prop is updated
  watch(() => rest.path, (path) => {
    fetchPath(path)
  })

  // Emit select event
  ds.onSelect((items) => {
    emit('select', items);
  });

  // Emit update:path event
  watch(() => app.fs.data.dirname, (path) => {
    emit('update:path', path)
  })

});

</script>

<style lang="postcss" scoped>
.vuefinder {
  & .container {
    @apply overflow-hidden min-h-44 border flex flex-col bg-white dark:bg-gray-800 text-gray-700 dark:text-neutral-400 border-neutral-300 dark:border-gray-900 select-none;

    &.is-fixed {
      @apply fixed w-screen inset-0 z-20;
    }

    &.is-relative {
      @apply relative rounded resize-y;

    }

    .content {
      @apply relative flex overflow-hidden h-full;
    }
  }
}
</style>