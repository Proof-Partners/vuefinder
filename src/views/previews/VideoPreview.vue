<template>
  <div class="vuefinder__video-preview">
    <h3 class="vuefinder__video-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
      {{ app.modal.data.value.item.basename }}
    </h3>
    <div>
      <video class="vuefinder__video-preview__video" preload="auto" controls>
        <source :src="getVideoUrl()" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceContainer } from '@/ServiceContainer';
import { inject, onMounted } from 'vue';

const app = inject<ServiceContainer>("ServiceContainer")!;
const emit = defineEmits(['success']);

const getVideoUrl = () => {
  return app.requester.getPreviewUrl(app.modal.data.value.adapter, app.modal.data.value.item)
}

onMounted(() => {
  emit('success');
});

</script>
