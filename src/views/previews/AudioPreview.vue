<template>
  <div class="vuefinder__audio-preview">
    <h3 class="vuefinder__audio-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
      {{ app.modal.data.value.item.basename }}
    </h3>
    <div>
      <audio class="vuefinder__audio-preview__audio" controls>
        <source :src="getAudioUrl()" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
</template>

<script setup lang="ts">

import { inject, onMounted } from 'vue';

import type { ServiceContainer } from '@/ServiceContainer';

const emit = defineEmits(['success']);

const app = inject<ServiceContainer>('ServiceContainer')!;

const getAudioUrl = () => {
  return app.requester.getPreviewUrl(app.modal.data.value.adapter, app.modal.data.value.item)
}

onMounted(() => {
  emit('success');
});

</script>
