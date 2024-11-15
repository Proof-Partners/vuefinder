import mitt, { type Emitter as MittEmitter } from 'mitt';
import type { Item } from './useData';
type FetchParams = {
    q: string;
    m?: 'delete' | 'get' | 'post' | 'put' | 'patch';
    adapter?: string;
    path?: string;
    filter?: string;
}

export type Events = {
    fetch: string;
    'vf-context-selected': Item[];
    'vf-contextmenu-show': { x?: number, y?: number, items: Item[], event: MouseEvent, target?: Item };
    'vf-contextmenu-hide': void;
    'vf-fetch': { params: FetchParams, body?: Record<string, unknown> | FormData | null, onSuccess?: (data: Record<string, unknown>) => void, onError?: (error: Error) => void, noCloseModal?: boolean };
    'vf-fetch-abort': void;
    'vf-fullscreen-toggle': void;
    'vf-search-query': { newQuery: string };
    'vf-search-exit': void;
    'vf-toast-push': { label: string, type?: 'success' | 'error', id?: string };
    'vf-toast-clear': void;
    'vf-theme-saved': void;
    'vf-language-saved': void;
    'vf-metric-units-saved': void;
    'vf-compact-view-saved': void;
    'vf-show-thumbnails-saved': void;
    'vf-persist-path-saved': void;
};

export type Emitter = MittEmitter<Events>;

export function useEmit(): Emitter {
    const emitter: Emitter = mitt();

    return emitter;
}