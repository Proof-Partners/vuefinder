<template>
  <div class="vuefinder__text-preview">
    <div class="vuefinder__text-preview__header">
      <div class="vuefinder__text-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
        {{ app.modal.data.value.item.basename }}
      </div>
      <div class="vuefinder__text-preview__actions">
        <button @click="save" class="vuefinder__text-preview__save-button" v-if="showEdit">
          {{ t('Save') }}
        </button>
        <button class="vuefinder__text-preview__edit-button" @click="editMode()"
          v-if="app.features.includes(FEATURES.EDIT)">
          {{ showEdit ? t('Cancel') : t('Edit') }}
        </button>
      </div>
    </div>
    <div>
      <pre v-if="!showEdit" class="vuefinder__text-preview__content">{{ content }}</pre>
      <div v-else>
        <textarea ref="editInput" v-model="contentTemp" class="vuefinder__text-preview__textarea" name="text" cols="30"
          rows="10"></textarea>
      </div>
      <simple-message v-if="message.length" @hidden="message = ''" :error="isError">{{ message }}</simple-message>
    </div>
  </div>
</template>

<script setup lang="ts">

import { inject, onMounted, ref } from 'vue';
import SimpleMessage from '@/components/SimpleMessage.vue';
import { FEATURES } from "@/features.js";
import type { ServiceContainer } from '@/ServiceContainer';

const emit = defineEmits(['success'])
const content = ref('');
const contentTemp = ref('');
const editInput = ref(null);
const showEdit = ref(false);

const message = ref('');
const isError = ref(false);

const app = inject<ServiceContainer>('ServiceContainer')!;

const { t } = app.i18n;

onMounted(() => {
  app.requester.send({
    url: '',
    method: 'get',
    params: { q: 'preview', adapter: app.modal.data.value.adapter, path: app.modal.data.value.item.path },
  })
    .then(res => res.text())
    .then(data => {
      content.value = data;
      emit('success');
    });
});

const editMode = () => {
  showEdit.value = !showEdit.value;
  contentTemp.value = content.value;
};

const save = () => {
  message.value = '';
  isError.value = false;

  app.requester.send({
    url: '',
    method: 'post',
    params: {
      q: 'save',
      adapter: app.modal.data.value.adapter,
      path: app.modal.data.value.item.path,
    },
    body: {
      content: contentTemp.value
    },
  })
    .then(res => res.text())
    .then(data => {
      message.value = t('Updated.');
      content.value = data;
      emit('success');
      showEdit.value = !showEdit.value;
    })
    .catch((e) => {
      message.value = t(e.message);
      isError.value = true;
    });
}

</script>
