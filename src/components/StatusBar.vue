<template>
  <div class="status-bar">
    <div class="storage">
      <div class="storage-container" :title="t('Storage')">
        <div class="storage-icon">
          <StorageSVG />
        </div>
        <select v-model="app.fs.adapter" @change="handleStorageSelect" class="storage-select" tabindex="-1">
          <option v-for="storage in app.fs.data.storages" :value="storage" :key="storage">
            {{ storage }}
          </option>
        </select>
      </div>
      <div class="info">
        <span v-if="searchQuery.length">{{ app.fs.data.files.length }} items found. </span>
        <span class="selected-count">{{ app.dragSelect.value.getCount() > 0 ? t('%s item(s) selected.',
          app.dragSelect.value.getCount()) : '' }}</span>
      </div>
    </div>
    <div class="actions">
      <button class="vf-btn py-0 vf-btn-primary" :class="{ disabled: !isSelectButtonActive }"
        :disabled="!isSelectButtonActive" v-if="app.selectButton && app.selectButton.active"
        @click="app.selectButton.click(ds.getSelected(), $event)">{{ t("Select") }}</button>
      <span class="about" :title="t('About')" @click="app.modal.open(ModalAbout)">
        <AboutSVG />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import ModalAbout from "@/views/modals/ModalAbout.vue";
import StorageSVG from "@/icons/storage.svg";
import AboutSVG from "@/icons/about.svg";
import type { ServiceContainer } from '@/ServiceContainer';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;
const { setStore } = app.storage;
const ds = app.dragSelect;

const handleStorageSelect = () => {
  app.emitter.emit('vf-search-exit');
  app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter.value } });
  setStore('adapter', app.fs.adapter);
};

const searchQuery = ref('');

app.emitter.on('vf-search-query', ({ newQuery }) => {
  searchQuery.value = newQuery;
});

const isSelectButtonActive = computed(() => {
  if (!app.selectButton) {
    return false;
  }
  const selectionAllowed = app.selectButton.multiple ? ds.value.getSelected().length > 0 : ds.value.getSelected().length === 1;
  return app.selectButton.active && selectionAllowed;
});

</script>

<style lang="postcss" scoped>
.status-bar {
  @apply p-1 text-xs border-t border-neutral-300 dark:border-gray-700/50 flex justify-between select-none grow-0;

  & .storage {
    @apply flex leading-5 items-center;
  }

  & .storage-container {
    @apply flex leading-5 items-center rounded border dark:bg-gray-700 dark:border-gray-600;
  }

  & .storage-icon {
    @apply z-[1] pointer-events-none;
  }

  & .storage-select {
    @apply border-0 py-0.5 text-xs text-slate-500 bg-white dark:text-neutral-50 dark:bg-gray-700 rounded uppercase focus:outline-0 cursor-pointer;
  }

  & .info {
    @apply ml-3;
  }

  & .selected-count {
    @apply ml-1;
  }

  & .actions {
    @apply flex leading-5 items-center justify-end;
  }

  & .about {
    @apply mr-1;
  }
}
</style>