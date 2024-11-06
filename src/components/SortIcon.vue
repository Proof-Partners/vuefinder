<template>
  <div>
    <AscSVG v-if="direction === 'asc'" />
    <DescSVG v-if="direction === 'desc'" />
  </div>
</template>

<script setup lang="ts">
import AscSVG from './icons/asc.svg';
import DescSVG from './icons/desc.svg';

defineProps < { direction: 'asc' | 'desc' } > ();
</script>
