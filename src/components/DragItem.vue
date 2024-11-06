<template>
  <div class="container">
    <DragSVG />
    <div class="count">{{ count }}</div>
  </div>
</template>

<script setup lang="ts">
import DragSVG from './icons/drag.svg';
let { count = 0 } = defineProps<{ count: number }>();

</script>

<style lang="postcss" scoped>
.container {
  @apply absolute -z-50 -top-96;

  & .count {
    @apply text-neutral-700 dark:text-neutral-300 p-1 absolute text-center top-4 right-[-2rem] md:top-5 md:right-[-2.4rem] z-20 text-xs;
  }
}
</style>