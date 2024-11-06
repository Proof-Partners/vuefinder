<template>
  <div class="folder-indicator">
    <div class="icon">
      <SquareMinusSVG class="minus" v-if="model" />
      <SquarePlusSVG class="plus" v-if="!model" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SquarePlusSVG from "./icons/plus.svg";
import SquareMinusSVG from "./icons/minus.svg";

// TODO what does the value represent?
const model = defineModel<bool>();

</script>

<style lang="postcss" scoped>
.folder-indicator {
  @apply h-5 w-5 shrink-0;

  & .icon {
    @apply cursor-pointer;

    & .minus {
      @apply text-gray-600;
    }

    & .plus {
      @apply text-gray-400;
    }
  }
}
</style>
