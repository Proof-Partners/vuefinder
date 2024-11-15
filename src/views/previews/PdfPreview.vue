<template>
  <div class="vuefinder__pdf-preview">
    <h3 class="vuefinder__pdf-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
      {{ app.modal.data.value.item.basename }}
    </h3>
    <div>
      <object class="vuefinder__pdf-preview__object" :data="getPDFUrl()" type="application/pdf" width="100%"
        height="100%">
        <iframe class="vuefinder__pdf-preview__iframe" :src="getPDFUrl()" width="100%" height="100%">
          Your browser does not support PDFs
        </iframe>
      </object>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ServiceContainer } from '@/ServiceContainer';
import { inject, onMounted } from 'vue';

const app = inject<ServiceContainer>('ServiceContainer')!;

const emit = defineEmits(['success']);

const getPDFUrl = () => {
  return app.requester.getPreviewUrl(app.modal.data.value.adapter, app.modal.data.value.item)
}

onMounted(() => {
  emit('success');
});


</script>
