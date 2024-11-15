<template>
  <div class="folder-loader-indicator">

    <LoadingSVG v-if="loading" class="loading" />
    <div class="icon" v-else>
      <SquareMinusSVG class="minus" v-if="opened && getLoadedFolder()?.folders?.length" />
      <SquarePlusSVG class="plus" v-if="!opened" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';

import SquarePlusSVG from "@/icons/plus.svg";
import SquareMinusSVG from "@/icons/minus.svg";
import LoadingSVG from "@/icons/loading.svg";
import upsert from "@/utils/upsert";
import type { ServiceContainer } from '@/ServiceContainer';

// TODO move state elsewhere?
// TODO reuse FolderIndicator.vue?

const { adapter, path } = defineProps<{ adapter: string, path: string }>();

const app = inject<ServiceContainer>('ServiceContainer')!;
// const {t} = app.i18n;
const opened = defineModel<boolean>('opened');
const loading = ref(false)

// loading..

watch(() => opened.value, () =>
  getLoadedFolder()?.folders?.length || fetchSubFolders()
);

// function toggleIndicator() {
//   return opened.value = !opened.value;
// }

function getLoadedFolder() {
  return app.treeViewData.find(e => e.path === path);
}

const fetchSubFolders = () => {
  loading.value = true;
  app.requester.send({
    url: '',
    method: 'get',
    params: {
      q: 'subfolders',
      adapter,
      path,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      upsert(app.treeViewData, { path, ...data })
      // }).catch(() => {
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
