import { customRef, ref } from 'vue'

export type Timeout = ReturnType<typeof setTimeout>;

const debounce = (fn: (...args: unknown[]) => void, delay = 0, immediate = false) => {
  let timeout: Timeout;
  return (...args: unknown[]) => {
    if (immediate && !timeout) {
      fn(...args);
    }
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args)
    }, delay);
  };
};

const useDebouncedRef = <T = unknown>(initialValue: T, delay = 0, immediate = false) => {
  const state = ref<T>(initialValue);
  return customRef<T>((track, trigger) => ({
    get() {
      track();
      return state.value;
    },
    set: debounce(
      value => {
        state.value = value;
        trigger();
      },
      delay,
      immediate,
    ),
  }));
};

export default useDebouncedRef;
