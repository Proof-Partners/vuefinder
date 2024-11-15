<template>
  <ModalLayout>
    <div>
      <ModalHeader :icon="NewFolderSVG" :title="t('New Folder')"></ModalHeader>
      <div class="vuefinder__new-folder-modal__content">
        <div class="vuefinder__new-folder-modal__form">
          <p class="vuefinder__new-folder-modal__description">{{ t('Create a new folder') }}</p>
          <input v-model="name" @keyup.enter="createFolder" class="vuefinder__new-folder-modal__input"
            :placeholder="t('Folder Name')" type="text">
          <SimpleMessage v-if="message.length" @hidden="message = ''" error>{{ message }}</SimpleMessage>
        </div>
      </div>
    </div>

    <template v-slot:buttons>
      <button type="button" @click="createFolder" class="vf-btn vf-btn-primary">{{ t('Create') }}</button>
      <button type="button" @click="app.modal.close()" class="vf-btn vf-btn-secondary">{{ t('Cancel') }}</button>
    </template>
  </ModalLayout>
</template>

<script setup lang="ts">
import ModalLayout from './ModalLayout.vue';
import { inject, ref } from 'vue';
import SimpleMessage from '@/components/SimpleMessage.vue';
import ModalHeader from "./ModalHeader.vue";
import NewFolderSVG from "../icons/new_folder.svg";
import type { ServiceContainer } from '@/ServiceContainer';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;

const name = ref('');
const message = ref('');

const createFolder = () => {
  if (name.value !== '') {
    app.emitter.emit('vf-fetch', {
      params: {
        q: 'newfolder',
        m: 'post',
        adapter: app.fs.adapter.value,
        path: app.fs.data.dirname,
      },
      body: {
        name: name.value
      },
      onSuccess: () => {
        app.emitter.emit('vf-toast-push', { label: t('%s is created.', name.value) });
      },
      onError: (e) => {
        message.value = t(e.message);
      }
    });
  }
};

</script>
