<template>
  <div
    :style="{ opacity: ds.isDraggingRef.value && ds.getSelection().find((el) => $el === el) ? '0.5 !important' : '' }"
    :class="['item', `vf-item-${ds.explorerId}`]" :data-type="item.type" :key="item.path"
    :data-item="JSON.stringify(item)" :data-index="index" v-draggable="item" @dblclick="openItem(item)"
    @touchstart="delayedOpenItem($event)" @touchend="clearTimeOut()"
    @contextmenu.prevent="app.emitter.emit('vf-contextmenu-show', { event: $event, items: ds.getSelected(), target: item })">
    <slot />
    <PinSVG class="pinned" v-if="app.pinnedFolders.find(pin => pin.path === item.path)" />
    <div class="drag-item">
      <DragItem ref="dragImage" :count="dragCount" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { inject, useTemplateRef, type Ref, type VNode } from 'vue';
import ModalPreview from "@/views/modals/ModalPreview.vue";
import ModalMove from "@/views/modals/ModalMove.vue";
import PinSVG from "@/icons/pin.svg";
import type { ServiceContainer } from '@/ServiceContainer';
import type { Item } from '@/composables/useData';

import DragItem from "./DragItem.vue";

const dragImage = useTemplateRef('dragImage');

const app = inject<ServiceContainer>('ServiceContainer')!;
const ds = app.dragSelect;

const props = defineProps<{ item: Item, index: number, dragCount: number }>();

const openItem = (item: Item) => {
  if (item.type === 'dir') {
    app.emitter.emit('vf-search-exit');
    app.emitter.emit('vf-fetch', { params: { q: 'index', adapter: app.fs.adapter.value, path: item.path } });
  } else {
    app.modal.open(ModalPreview, { adapter: app.fs.adapter, item })
  }
};

// TODO add types, or remove draggable prop
const vDraggable = {
  mounted(el: Element, binding: Ref<Item>, vnode: VNode, /* prevVnode: VNode */) {
    if (!!vnode.props?.draggable) {
      el.addEventListener('dragstart', (event) => handleDragStart(event as DragEvent));
      el.addEventListener('dragover', (event) => handleDragOver(event as DragEvent, binding.value));
      el.addEventListener('drop', (event) => handleDropZone(event as DragEvent, binding.value));
    }
  },
  beforeUnmount(el: Element, binding: Ref<Item>, vnode: VNode, /* prevVnode: VNode */) {
    if (!!vnode.props?.draggable) {
      el.removeEventListener('dragstart', (event) => handleDragStart(event as DragEvent));
      el.removeEventListener('dragover', (event) => handleDragOver(event as DragEvent, binding.value));
      el.removeEventListener('drop', (event) => handleDropZone(event as DragEvent, binding.value));
    }
  }
}

const handleDragStart = (e: DragEvent) => {
  if (e.altKey || e.ctrlKey || e.metaKey) {
    e.preventDefault();
    return false;
  }

  ds.value.isDraggingRef.value = true;
  e.dataTransfer!.setDragImage(dragImage.value! as unknown as Element, 0, 15);
  e.dataTransfer!.effectAllowed = 'all';
  e.dataTransfer!.dropEffect = 'copy';
  e.dataTransfer!.setData('items', JSON.stringify(ds.value.getSelected()))
};

const handleDropZone = (e: DragEvent, item: Item) => {
  e.preventDefault();
  ds.value.isDraggingRef.value = false;
  const draggedItems: Item[] = JSON.parse(e.dataTransfer!.getData('items'));

  if (draggedItems.find((item) => item.storage !== app.fs.adapter.value)) {
    alert('Moving items between different storages is not supported yet.');
    return;
  }

  app.modal.open(ModalMove, { items: { from: draggedItems, to: item } })
};

const handleDragOver = (e: DragEvent, item: Item) => {
  e.preventDefault();
  if (!item || item.type !== 'dir' || ds.value.getSelection().find((el) => el === e.currentTarget)) {
    e.dataTransfer!.dropEffect = 'none';
    e.dataTransfer!.effectAllowed = 'none';
  } else {
    e.dataTransfer!.dropEffect = 'copy';
  }
};

let touchTimeOut: number;
// let doubleTapTimeOut: number;
let tappedTwice = false;

const clearTimeOut = () => {
  if (touchTimeOut) {
    clearTimeout(touchTimeOut);
  }
}

const delayedOpenItem = (event: TouchEvent) => {
  if (!tappedTwice) {
    tappedTwice = true;
    // doubleTapTimeOut = setTimeout(() => tappedTwice = false, 300);
  } else {
    tappedTwice = false;
    openItem(props.item);
    clearTimeout(touchTimeOut);
    return false;
  }
  touchTimeOut = setTimeout(() => {
    const cmEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: false,
      view: window,
      button: 2,
      buttons: 0,
      clientX: (event.target as HTMLElement).getBoundingClientRect().x,
      clientY: (event.target as HTMLElement).getBoundingClientRect().y
    });
    event.target!.dispatchEvent(cmEvent);

  }, 500)
}

</script>

<style lang="postcss" scoped>
.item {
  position: relative;
}

& .pinned {
  @apply absolute top-0 right-0 text-amber-600;
}
</style>