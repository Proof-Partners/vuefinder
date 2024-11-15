<template>
  <div :class="['action-message', { 'hidden': !shown }]">
    <slot v-if="$slots.default" />
    <span v-else>{{ t('Saved.') }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';
import type { Timeout } from '@/composables/useDebouncedRef';
import type { ServiceContainer } from '@/ServiceContainer';
import type { Events } from '@/composables/useEmit';

const props = defineProps<{ on: keyof Events }>();

const app = inject<ServiceContainer>('ServiceContainer')!;
const shown = ref(false);
const { t } = app.i18n;

let timeout: Timeout;

const handleEvent = () => {
  clearTimeout(timeout);
  shown.value = true;
  timeout = setTimeout(() => {
    shown.value = false;
  }, 2000);
};

onMounted(() => {
  app.emitter.on(props.on, handleEvent);
});

onUnmounted(() => {
  clearTimeout(timeout);
});
</script>

<style lang="postcss" scoped>
.message {
  @apply text-sm text-green-600 dark:text-green-600 transition-opacity duration-500 ease-out;

  &.hidden {
    @apply opacity-0;
  }
}
</style>