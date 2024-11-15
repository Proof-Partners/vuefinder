import { computed, onMounted, reactive, ref, watch, type Ref } from "vue";

export type Item = {
    basename?: string,
    name?: string,
    path: string,
    type?: string,
    adapter?: string,
    mime_type?: string,
    file_size?: number,
    last_modified?: number,
    storage?: string,
    folders?: Item[],
};

// TODO why is all of the breadcrums stuff here?

export default function (initialAdapter: string, initialPath: string) {

    const adapter = ref(initialAdapter);
    const path = ref(initialPath);
    const breadcrumbs = ref<Item[]>([]);
    const breadcrumbItems = ref<Item[]>([]);
    const hiddenBreadcrumbs = ref<Item[]>([]);
    const showHiddenBreadcrumbs = ref(false);
    const breadcrumbItemLimit = ref(5);

    // TODO why are these constants and not refs?
    const loading = false; // loading state
    const searchMode = false;


    // fetched items
    const data = reactive<{ adapter: Ref<string>, storages: string[], dirname: Ref<string>, files: Item[] }>({
        adapter: adapter,
        storages: [],
        dirname: path,
        files: []
    });

    // breadcrumbs for the current path
    function updateBreadcrumbs() {
        const items: string[] = [];
        const links: Item[] = [];

        const dirname = path.value ?? (adapter.value + '://');

        if (dirname.length === 0) {
            breadcrumbs.value = [];
        }

        dirname
            .replace(adapter.value + '://', '')
            .split('/')
            .forEach((item) => {
                items.push(item);
                if (items.join('/') !== '') {
                    links.push({
                        'basename': item,
                        'name': item,
                        'path': adapter.value + '://' + items.join('/'),
                        'type': 'dir'
                    });
                }
            });

        breadcrumbItems.value = links;

        const [linksToDisplay, hiddenLinks] = separateBreadcrumbs(links, breadcrumbItemLimit.value);

        hiddenBreadcrumbs.value = hiddenLinks;
        breadcrumbs.value = linksToDisplay;
    }

    function limitBreadcrumbItems(count: number) {
        breadcrumbItemLimit.value = count;
        updateBreadcrumbs();
    }

    function separateBreadcrumbs(links: Item[], show: number) {
        if (links.length > show) {
            return [links.slice(-show), links.slice(0, -show)];
        }

        return [links, []]
    }

    function toggleHiddenBreadcrumbs(value?: boolean) {
        if (value === undefined) {
            value = !showHiddenBreadcrumbs.value;
        }
        showHiddenBreadcrumbs.value = value;
    }

    function isGoUpAvailable() {
        return breadcrumbs.value && breadcrumbs.value.length && !searchMode;
    };

    const parentFolderPath = computed(() => {
        return breadcrumbs.value[breadcrumbs.value.length - 2]?.path ?? (adapter.value + '://');
    });

    onMounted(() => {
        // load data
    });

    watch(path, updateBreadcrumbs)
    onMounted(updateBreadcrumbs)

    return {
        adapter,
        path,
        loading,
        searchMode,
        data,
        breadcrumbs,
        breadcrumbItems,
        limitBreadcrumbItems,
        hiddenBreadcrumbs,
        showHiddenBreadcrumbs,
        toggleHiddenBreadcrumbs,
        isGoUpAvailable,
        parentFolderPath
    }
}
