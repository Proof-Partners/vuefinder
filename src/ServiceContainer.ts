import { computed, reactive, type ComputedRef, type Ref } from "vue";
// import mitt, { type Emitter } from "mitt";
import { version } from '../package.json';

import { FEATURE_ALL_NAMES, FEATURES } from "@/features";
import { format as filesizeDefault, metricFormat as filesizeMetric } from '@/utils/filesize';
import { buildRequester, type RequestConfig } from "@/utils/ajax";
import { useStorage } from "@/composables/useStorage";
import { useI18n } from "@/composables/useI18n";
import { useEmit, type Emitter } from "@/composables/useEmit";
import useTheme from '@/composables/useTheme';
import useModal from "@/composables/useModal";
import useDragSelect from "@/composables/useDragSelect";
import useData, { type Item } from "@/composables/useData";

export type SelectHandler = {
    // show select button
    active: true,
    // allow multiple selection
    multiple: false,
    // handle click event
    click: (items: Item[], event: MouseEvent) => void,
}

export type ServiceContainer = {
    version: string;
    root: Ref<HTMLElement | null>;
    debug: boolean;
    emitter: Emitter;
    storage: ReturnType<typeof useStorage>;
    i18n: ReturnType<typeof useI18n>;
    modal: ReturnType<typeof useModal>;
    dragSelect: ComputedRef<ReturnType<typeof useDragSelect>>;
    requester: ReturnType<typeof buildRequester>;
    features: FEATURES[];
    view: string;
    fullScreen: boolean;
    showTreeView: boolean;
    pinnedFolders: Item[];
    treeViewData: (Item & {})[];
    selectButton: SelectHandler | false;
    maxFileSize: string | number;
    theme: ReturnType<typeof useTheme>;
    metricUnits: boolean;
    filesize: (bytes: number) => string;
    compactListView: boolean;
    persist: boolean;
    showThumbnails: boolean;
    loadingIndicator: string;
    fs: ReturnType<typeof useData>;
};

export type ServiceContainerProps = {
    id: string;
    request: string | RequestConfig;
    fullScreen: boolean;
    showTreeView: boolean;
    showThumbnails: boolean;
    persist: boolean;
    path: string;
    pinnedFolders: Item[];
    debug: boolean;
    locale: string;
    theme: string;
    selectButton: SelectHandler | false;
    maxFileSize: string | number;
    features?: FEATURES[];
    loadingIndicator: string;
    root: Ref<HTMLElement | null>;
};

export type Options = {
    i18n: Record<string, unknown>;
    locale: string;
}

export default (props: ServiceContainerProps, options?: Options) => {
    const storage = useStorage(props.id);
    const emitter = useEmit();

    const metricUnits = storage.getStore('metricUnits', false)!;
    const theme = useTheme(storage, props.theme);

    const i18n = useI18n(storage, props.locale ?? options!.locale, emitter, options!.i18n);

    const setFeatures = (features?: FEATURES[]) => (features && Array.isArray(features) ? features : FEATURE_ALL_NAMES);

    const persist = storage.getStore('persist-path', props.persist)!;

    const path = persist ? storage.getStore('path', props.path)! : props.path;
    const adapter = persist ? storage.getStore<string>('adapter', 'local')! : 'local';

    const dragSelect = useDragSelect();

    const modal = useModal();

    return reactive<ServiceContainer>({
        /** 
        * Core properties
        * */

        // app version
        version,
        // root element
        root: props.root,
        // app id
        debug: props.debug,
        // Event Bus
        emitter,
        // storage
        storage,
        // localization object
        i18n,
        // modal state
        modal,
        // dragSelect object, it is responsible for selecting items
        dragSelect: computed(() => dragSelect),
        // http object
        requester: buildRequester(props.request),
        // active features
        features: setFeatures(props.features),
        // view state
        view: storage.getStore('viewport', 'grid')!,
        // fullscreen state
        fullScreen: storage.getStore('full-screen', props.fullScreen)!,
        // show tree view
        showTreeView: storage.getStore('show-tree-view', props.showTreeView)!,
        // pinnedFolders
        pinnedFolders: storage.getStore('pinned-folders', props.pinnedFolders)!,
        // treeViewData
        treeViewData: [],
        // selectButton state
        selectButton: props.selectButton,
        // max file size
        maxFileSize: props.maxFileSize,

        /**
        * Settings
        * */

        // theme state
        theme: theme,
        // unit state - for example: GB or GiB
        metricUnits: metricUnits,
        // human readable file sizes
        filesize: metricUnits ? filesizeMetric : filesizeDefault,
        // show large icons in list view
        compactListView: storage.getStore('compact-list-view', true)!,
        // persist state
        persist: persist,
        // show thumbnails
        showThumbnails: storage.getStore('show-thumbnails', props.showThumbnails)!,
        // type of progress indicator
        loadingIndicator: props.loadingIndicator,

        // file system
        fs: useData(adapter, path),
    });
}
