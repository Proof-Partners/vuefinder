<template>
  <span class="item-icon">
    <FolderSVG v-if="type === 'dir'" :class="small ? 'small' : 'large'" />
    <FileSVG v-else :class="small ? 'small' : 'large'" />
  </span>
</template>

<script setup lang="ts">
import FileSVG from './icons/file.svg';
import FolderSVG from './icons/folder.svg';

const { small = false } = defineProps<{ type: string, small: bool }>();

</script>

<style lang="postcss" scoped>
.item-icon svg {
  & .small {
    @apply h-5 w-5;
  }

  & .large {
    @apply h-10 w-10 md:h-12 md:w-12 m-auto;
  }
}
</style>