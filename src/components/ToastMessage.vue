<template>
  <div :class="['toast', fullScreen ? 'is-fixed' : 'is-absolute']">
    <transition-group name="vuefinder__toast-item" enter-active-class="toast-item--enter-active"
      leave-active-class="toast-item--leave-active" leave-to-class="toast-item--leave-to">
      <div v-for="(message, index) in messageQueue" :key="index" @click="removeItem(index)"
        :class="['message', { error: message.type === 'error' }]">
        {{ message.label }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import type { ServiceContainer } from '@/ServiceContainer';
import { type Events } from '@/composables/useEmit';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { getStore } = app.storage;

const fullScreen = ref(getStore('full-screen', false));
const messageQueue = ref<(Events['vf-toast-push'])[]>([]);

const removeItem = (index: number) => {
  messageQueue.value.splice(index, 1);
};

const removeItemByID = (uid: string) => {
  const index = messageQueue.value.findIndex(x => x.id === uid);
  if (index !== -1) {
    removeItem(index);
  }
};

app.emitter.on('vf-toast-clear', () => {
  messageQueue.value = [];
});

app.emitter.on('vf-toast-push', (data) => {
  const uid = new Date().getTime().toString(36).concat(performance.now().toString(), Math.random().toString()).replace(/\./g, "");
  data.id = uid;
  messageQueue.value.push(data);

  setTimeout(() => {
    removeItemByID(uid)
  }, 5000)
})
</script>

<style lang="postcss" scoped>
.toast {
  @apply max-w-fit flex flex-col bottom-0 left-1/2 -translate-x-1/2 z-10;

  &.is-fixed {
    @apply fixed;
  }

  &.is-absolute {
    @apply absolute;
  }
}


.message {
  @apply inline-block mx-auto my-0.5 py-0.5 px-2 min-w-max bg-gray-50 dark:bg-gray-600 border text-xs sm:text-sm rounded cursor-pointer;

  @apply text-lime-600 border-lime-600 dark:text-lime-300 dark:border-lime-1300;

  &.error {
    @apply text-red-400 border-red-400 dark:text-red-300 dark:border-red-300;
  }
}

/* Transition classes */
.toast-item--enter-active {
  @apply transition-all duration-1000;
}

.toast-item--leave-active {
  @apply transition-all duration-1000 opacity-0;
}

.toast-item--leave-to {
  @apply opacity-0;
}
</style>
