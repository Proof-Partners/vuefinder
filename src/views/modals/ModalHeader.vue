<template>
  <div class="vuefinder__modal-header">
    <div class="vuefinder__modal-header__icon-container">
      <component :is="icon" class="vuefinder__modal-header__icon"></component>
    </div>
    <h3 class="vuefinder__modal-header__title" id="modal-title">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';


defineProps<{ title: string, icon: VNode | string }>();

</script>
