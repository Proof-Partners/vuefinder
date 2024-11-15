<template>
  <ModalLayout>
    <div>
      <ModalHeader :icon="ArchiveSVG" :title="t('Archive the files')"></ModalHeader>
      <div class="vuefinder__archive-modal__content">
        <div class="vuefinder__archive-modal__form">
          <div class="vuefinder__archive-modal__files vf-scrollbar">
            <p v-for="item in items" class="vuefinder__archive-modal__file" :key="item.name">
              <svg v-if="item.type === 'dir'" class="vuefinder__archive-modal__icon vuefinder__archive-modal__icon--dir"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <svg v-else class="vuefinder__archive-modal__icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="vuefinder__archive-modal__file-name">{{ item.basename }}</span>
            </p>
          </div>
          <input v-model="name" @keyup.enter="archive" class="vuefinder__archive-modal__input"
            :placeholder="t('Archive name. (.zip file will be created)')" type="text">
          <SimpleMessage v-if="message.length" @hidden="message = ''" error>{{ message }}</SimpleMessage>
        </div>
      </div>
    </div>

    <template v-slot:buttons>
      <button type="button" @click="archive" class="vf-btn vf-btn-primary">{{ t('Archive') }}</button>
      <button type="button" @click="app.modal.close()" class="vf-btn vf-btn-secondary">{{ t('Cancel') }}</button>
    </template>
  </ModalLayout>
</template>

<script setup lang="ts">
import ModalLayout from './ModalLayout.vue';
import { inject, ref } from 'vue';
import SimpleMessage from '@/components/SimpleMessage.vue';
const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;
import ArchiveSVG from "@/icons/archive.svg";
import ModalHeader from "./ModalHeader.vue";
import type { ServiceContainer } from '@/ServiceContainer';
import type { Item } from '@/composables/useData';

const name = ref('');
const message = ref('');

const items = ref<Item[]>(app.modal.data.value.items);

const archive = () => {
  if (items.value.length) {
    app.emitter.emit('vf-fetch', {
      params: {
        q: 'archive',
        m: 'post',
        adapter: app.fs.adapter.value,
        path: app.fs.data.dirname,
      },
      body: {
        items: items.value.map(({ path, type }) => ({ path, type })),
        name: name.value,
      },
      onSuccess: () => {
        app.emitter.emit('vf-toast-push', { label: t('The file(s) archived.') });
      },
      onError: (e) => {
        message.value = t(e.message);
      }
    });
  }
};

</script>
