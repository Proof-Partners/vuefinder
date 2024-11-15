<template>
  <div>
    <div v-if="!hidden" ref="strMessage" :class="['message', error ? 'error' : 'success']">
      <slot></slot>
      <div class="close" @click="hide" :title="t('Close')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceContainer } from '@/ServiceContainer';
import { ref, watch, inject, useTemplateRef } from 'vue';

const emit = defineEmits(['hidden']);
const { error = false } = defineProps<{ error: boolean }>();

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;

const hidden = ref(false);
const strMessage = useTemplateRef('strMessage')
const strSlot = defineSlots().default;

watch(strSlot, () => hidden.value = false);

const hide = () => {
  emit('hidden');
  hidden.value = true;
};
</script>

<style lang="postcss" scoped>
.message {
  @apply flex mt-2 p-1 px-2 rounded text-sm break-all dark:opacity-75;

  &.error {
    @apply bg-red-100 text-red-600;
  }

  &.success {
    @apply bg-emerald-100 text-emerald-600;
  }

  & .close {
    @apply ml-auto cursor-pointer;

    & .icon {
      @apply w-5 h-5;
    }
  }
}
</style>
