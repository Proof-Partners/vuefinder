import { reactive, ref, watch } from 'vue';
import type { Storage } from './useStorage';
import type { Emitter } from './useEmit';

export async function loadLocale(locale: string, supportedLocales: Record<string, unknown>) {
    const localeData = supportedLocales[locale];
    return typeof localeData === 'function' ? (await localeData()).default : localeData;
}

export type I18n = ReturnType<typeof useI18n>;

export function useI18n(storage: Storage, initialLocale: string, emitter: Emitter, supportedLocales: Record<string, unknown>) {
    const { getStore, setStore } = storage;
    const translations = ref<Record<string, string>>({});
    const locale = ref(getStore('locale', initialLocale)!);

    const changeLocale = (newLocale: string, defaultLocale = initialLocale) => {
        loadLocale(newLocale, supportedLocales).then((i18n) => {
            translations.value = i18n;
            setStore('locale', newLocale);
            locale.value = newLocale;
            setStore('translations', i18n);
            if (Object.values(supportedLocales).length > 1) {
                emitter.emit('vf-toast-push', { label: 'The language is set to ' + newLocale });
                emitter.emit('vf-language-saved');
            }
        }).catch(() => {
            if (defaultLocale) {
                emitter.emit('vf-toast-push', { label: 'The selected locale is not yet supported!', type: 'error' });
                changeLocale(defaultLocale);
            } else {
                emitter.emit("vf-toast-push", { label: "Locale cannot be loaded!", type: "error" });
            }
        });
    };

    watch(locale, (newLocale) => {
        changeLocale(newLocale);
    });

    if (!getStore('locale') && !supportedLocales.length) {
        changeLocale(initialLocale);
    } else {
        translations.value = getStore('translations')!;
    }
    const sprintf = (str: string, ...argv: unknown[]): string => ((!argv.length) ? str : sprintf(str = str.replace('%s', argv.shift() as string), ...argv));

    function t(key: string, ...params: unknown[]): string {
        if (translations.value && translations.value.hasOwnProperty(key)) {
            return sprintf(translations.value[key], ...params);
        }
        return sprintf(key, ...params);
    };


    return reactive({ t, locale });
}

