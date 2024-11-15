import { ref, shallowRef, type Component } from "vue";

export default function () {
    const type = shallowRef<Component | null>(null);
    const visible = ref(false);
    const data = ref();

    const open = (modal: Component, payload?: unknown) => {
        document.querySelector('body')!.style.overflow = 'hidden';
        visible.value = true;
        type.value = modal;
        data.value = payload ?? null;
    };

    const close = () => {
        document.querySelector('body')!.style.overflow = '';
        visible.value = false;
        type.value = null;
    };

    return { visible, type, data, open, close };
}
