import { reactive, watch } from 'vue';

export type Storage = ReturnType<typeof useStorage>;

export function useStorage(key: string) {
    const lkey = `vuefinder_${key}`;

    const storedValues = localStorage.getItem(lkey) ?? '{}';

    const storage: Record<string, unknown> = reactive(JSON.parse(storedValues));

    watch(storage, () => {
        if (!Object.keys(storage).length) {
            localStorage.removeItem(lkey);
        } else {
            localStorage.setItem(lkey, JSON.stringify(storage));
        }
    });

    function setStore(key: string, value: unknown) {
        storage[key] = value;
    }

    function removeStore(key: string) {
        delete storage[key];
    }

    function clearStore() {
        Object.keys(storage).map(key => removeStore(key));
    }

    function getStore<T>(key: string, defaultValue?: T): T | null {
        if (storage.hasOwnProperty(key)) {
            return storage[key] as T;
        }
        return defaultValue ?? null;
    }

    return { getStore, setStore, removeStore, clearStore };
}
