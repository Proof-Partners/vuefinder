<template>
  <div class="vuefinder__image-preview">
    <div class="vuefinder__image-preview__header">
      <h3 class="vuefinder__image-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
        {{ app.modal.data.value.item.basename }}
      </h3>
      <div class="vuefinder__image-preview__actions">
        <button @click="crop" class="vuefinder__image-preview__crop-button" v-if="showEdit">
          {{ t('Crop') }}
        </button>
        <button class="vuefinder__image-preview__edit-button" @click="editMode()"
          v-if="app.features.includes(FEATURES.EDIT)">
          {{ showEdit ? t('Cancel') : t('Edit') }}
        </button>
      </div>
    </div>

    <div class="vuefinder__image-preview__image-container">
      <img ref="image" class="vuefinder__image-preview__image"
        :src="app.requester.getPreviewUrl(app.modal.data.value.adapter, app.modal.data.value.item)" alt="">
    </div>

    <message v-if="message.length" @hidden="message = ''" :error="isError">{{ message }}</message>
  </div>
</template>

<script setup lang="ts">
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
import { inject, onMounted, ref, useTemplateRef } from 'vue';
import { FEATURES } from "../../features.js";
import type { ServiceContainer } from '@/ServiceContainer.js';

const emit = defineEmits(['success']);

const app = inject<ServiceContainer>('ServiceContainer')!;

const { t } = app.i18n;

const image = useTemplateRef('image');
const cropper = ref<Cropper | null>(null);
const showEdit = ref(false);
const message = ref('');
const isError = ref(false);

const editMode = () => {
  showEdit.value = !showEdit.value;

  if (showEdit.value) {
    cropper.value = new Cropper(image.value!, {
      crop() {
      },
    });
  } else {
    cropper.value!.destroy();
  }
};

const crop = () => {
  cropper.value!
    .getCroppedCanvas({
      width: 795,
      height: 341
    })
    .toBlob(
      (blob) => {
        message.value = '';
        isError.value = false;
        const body = new FormData();
        body.set('file', blob!);
        app.requester.send({
          url: '',
          method: 'post',
          params: {
            q: 'upload',
            adapter: app.modal.data.value.adapter,
            path: app.modal.data.value.item.path,
          },
          body,
        })
          .then(res => res.json())
          .then(() => {
            message.value = t('Updated.');
            image.value!.src = app.requester.getPreviewUrl(app.modal.data.value.adapter, app.modal.data.value.item);
            editMode();
            emit('success');
          })
          .catch((e) => {
            message.value = t(e.message);
            isError.value = true;
          });
      });
};

onMounted(() => {
  emit('success');
});

</script>
