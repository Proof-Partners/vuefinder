import { ref } from 'vue';
import type { Storage } from './useStorage';

export enum THEMES {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark',
}

export default function (storage: Storage, propTheme: THEMES | string) {
  const theme = ref<THEMES | string>(THEMES.SYSTEM);
  const actualTheme = ref(THEMES.LIGHT);
  theme.value = storage.getStore('theme', propTheme) ?? THEMES.SYSTEM;

  const matcher = window.matchMedia('(prefers-color-scheme: dark)');

  const updateActualTheme = () => {
    if (theme.value === THEMES.DARK || (theme.value === THEMES.SYSTEM && matcher.matches)) {
      actualTheme.value = THEMES.DARK;
    } else {
      actualTheme.value = THEMES.LIGHT;
    }
  }

  updateActualTheme();
  matcher.addEventListener('change', updateActualTheme);

  return {
    value: theme,
    actualValue: actualTheme,
    set(value: THEMES | string) {
      theme.value = value;
      if (value !== THEMES.SYSTEM) {
        storage.setStore('theme', value);
      } else {
        storage.removeStore('theme');
      }
      updateActualTheme();
    },
  }
}
