import { ref, onMounted, onUpdated, onUnmounted, nextTick, useId } from 'vue';
import DragSelect, { type DSInputElement } from 'dragselect';
import {
    OverlayScrollbars,
} from 'overlayscrollbars';
import type { Item } from './useData';

export default function () {
    let dragSelectInstance: DragSelect;
    const area = ref<HTMLElement | null>(null);
    const explorerId = useId();
    const isDraggingRef = ref(false);
    const selectedItems = ref<Item[]>([]);
    const getSelected = () => selectedItems.value;
    const getSelection = () => dragSelectInstance.getSelection();
    const getCount = () => selectedItems.value.length;
    const clearSelection = () => dragSelectInstance.clearSelection(true);
    const onSelectCallback = ref<(items: Item[]) => void>(() => { });
    // ScrollBar
    const osInstance = ref<OverlayScrollbars | null>(null);
    const scrollBar = ref<HTMLElement | null>(null);
    const scrollBarContainer = ref<HTMLElement | null>(null);

    const resizeObserver = ref<ResizeObserver | null>(null);

    function initDragSelect() {
        dragSelectInstance = new DragSelect({
            area: area.value!,
            keyboardDrag: false,
            selectedClass: 'vf-explorer-selected',
            selectorClass: 'vf-explorer-selector',
        });

        dragSelectInstance.subscribe('DS:start:pre', ({ event, isDragging }) => {
            if (isDragging) {
                dragSelectInstance.Interaction._reset(event);
            } else {
                isDraggingRef.value = false;
                // Prevent starting selection when start resizing the selectable area from the corner.
                if (event instanceof MouseEvent) {
                    const offsetX = area.value!.offsetWidth - event.offsetX;
                    const offsetY = area.value!.offsetHeight - event.offsetY;
                    if (offsetX < 15 && offsetY < 15) {
                        dragSelectInstance.Interaction._reset(event);
                    }
                }
                if ((event.target as HTMLElement).classList.contains('os-scrollbar-handle')) {
                    dragSelectInstance.Interaction._reset(event);
                }
            }
        });

        // Immediately update the selection when dragging ends.
        document.addEventListener('dragleave', (e) => {
            if (!e.buttons && isDraggingRef.value) {
                isDraggingRef.value = false;
            }
        });
    }

    const selectAll = () => nextTick(() => {
        dragSelectInstance.addSelection(
            dragSelectInstance.getSelectables()
        );
        updateSelection();
    });

    const updateSelection = () => {
        // update selection
        selectedItems.value = dragSelectInstance.getSelection().map((el) => JSON.parse(el.dataset.item ?? '[]'));
        onSelectCallback.value(selectedItems.value);
    }

    // Refresh selection after the list is updated.
    const refreshSelection = () => nextTick(() => {
        const currentSelectedItems = getSelected().map((item) => item.path);

        clearSelection();
        // reinitialize the selectables
        const selectables = document.getElementsByClassName('vf-item-' + explorerId);
        dragSelectInstance.setSettings({
            selectables: Array.from(selectables) as DSInputElement[],
        });

        // add the previously selected items
        dragSelectInstance.addSelection(
            dragSelectInstance.getSelectables()
                .filter(el => currentSelectedItems.includes(JSON.parse(el.dataset.item!).path))
        );

        updateSelection();
        updateScrollbarHeight();
    });

    const onSelect = (callback: (items: Item[]) => void) => {
        onSelectCallback.value = callback;

        dragSelectInstance.subscribe("DS:end", ({ items }) => {
            selectedItems.value = items.map((el) => JSON.parse(el.dataset.item!));
            callback(items.map((el) => JSON.parse(el.dataset.item!)));
        });
    }

    const updateScrollbarHeight = () => {
        if (!osInstance.value) {
            return;
        }

        if (area.value!.getBoundingClientRect().height < area.value!.scrollHeight) {
            scrollBar.value!.style.height = area.value!.scrollHeight + 'px';
            scrollBar.value!.style.display = 'block';
        } else {
            scrollBar.value!.style.height = '100%';
            scrollBar.value!.style.display = 'none';
        }
    }

    const updateScrollBarPosition = () => {
        if (!osInstance.value) {
            return;
        }
        const { scrollOffsetElement } = osInstance.value!.elements();

        scrollOffsetElement.scrollTo({ top: area.value!.scrollTop, left: 0 });
    }

    onMounted(() => {
        // Super hacky way to get to work the scrollbar element
        OverlayScrollbars(scrollBarContainer.value!, {
            scrollbars: {
                theme: 'vf-theme-dark dark:vf-theme-light',
            },
            // plugins: {
            //     OverlayScrollbars,
            //     // ScrollbarsHidingPlugin,
            //     // SizeObserverPlugin,
            //     // ClickScrollPlugin
            // },
        }, {
            initialized: (instance) => {
                osInstance.value = instance;
            },
            scroll: (instance) => {
                // Update the file explorer area scroll position when the custom scroll bar is scrolled.
                const { scrollOffsetElement } = instance.elements();
                area.value!.scrollTo({
                    top: scrollOffsetElement.scrollTop,
                    left: 0,
                })
            }
        });

        initDragSelect()

        // Update scrollbar height when the area is resized.
        updateScrollbarHeight();
        resizeObserver.value = new ResizeObserver(updateScrollbarHeight);
        resizeObserver.value.observe(area.value!);

        // Update scrollbar position when the area is scrolled.
        area.value!.addEventListener('scroll', updateScrollBarPosition);
        dragSelectInstance.subscribe('DS:scroll', ({ isDragging }) => isDragging || updateScrollBarPosition());
    });

    onUnmounted(() => {
        if (dragSelectInstance) {
            dragSelectInstance.stop();
        }
        if (resizeObserver.value) {
            resizeObserver.value.disconnect();
        }
    });

    onUpdated(() => {
        if (dragSelectInstance) {
            dragSelectInstance.setSettings({ area: area.value! });
        }
    });

    return {
        area,
        explorerId,
        isDraggingRef,
        scrollBar,
        scrollBarContainer,
        getSelected,
        getSelection,
        selectAll,
        clearSelection,
        refreshSelection,
        getCount,
        onSelect
    }
}
