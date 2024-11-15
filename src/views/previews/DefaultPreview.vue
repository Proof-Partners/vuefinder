<template>
  <div class="vuefinder__default-preview">
    <div class="vuefinder__default-preview__header">
      <h3 class="vuefinder__default-preview__title" id="modal-title" :title="app.modal.data.value.item.path">
        {{ app.modal.data.value.item.basename }}
      </h3>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">

import type { ServiceContainer } from '@/ServiceContainer';
import { onMounted, inject } from 'vue';

const app = inject<ServiceContainer>('ServiceContainer')!;

const emit = defineEmits(['success']);

onMounted(() => {
  emit('success');
});
</script>
