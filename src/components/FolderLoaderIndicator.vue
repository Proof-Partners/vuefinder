<template>
  <div class="folder-loader-indicator">

    <LoadingSVG v-if="loading" class="loading" />
    <div class="icon" v-else>
      <SquareMinusSVG class="minus" v-if="opened && getLoadedFolder()?.folders.length" />
      <SquarePlusSVG class="plus" v-if="!opened" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';

import SquarePlusSVG from "./icons/plus.svg";
import SquareMinusSVG from "./icons/minus.svg";
import LoadingSVG from "./icons/loading.svg";
import upsert from "../utils/upsert";

// TODO move state elsewhere?
// TODO reuse FolderIndicator.vue?

const props = defineProps({
  adapter: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  }
});

const app = inject('ServiceContainer');
// const {t} = app.i18n;
const opened = defineModel<bool>('opened');
const loading = ref(false)

// loading..

watch(() => opened.value, () =>
  getLoadedFolder()?.folders.length || fetchSubFolders()
);

// function toggleIndicator() {
//   return opened.value = !opened.value;
// }

function getLoadedFolder() {
  return app.treeViewData.find(e => e.path === props.path);
}

const fetchSubFolders = () => {
  loading.value = true;
  app.requester.send({
    url: '',
    method: 'get',
    params: {
      q: 'subfolders',
      adapter: props.adapter,
      path: props.path,
    },
  })
    .then(data => {
      upsert(app.treeViewData, { path: props.path, ...data })
    })
    .catch((e) => {
    })
    .finally(() => {
      loading.value = false;
    });

}
</script>

<style lang="postcss" scoped>
.folder-loader-indicator {
  @apply h-5 w-5 shrink-0;

  & .loading {
    @apply p-1;
  }

  & .icon {
    @apply cursor-pointer;

    & .minus {
      @apply text-gray-600;
    }

    & .plus {
      @apply text-gray-400;
    }
  }
}
</style>