import { listen, TauriEvent } from '@tauri-apps/api/event';
import type { DragDropEvent } from '@tauri-apps/api/window';
import clsx from 'clsx';
import type { VoidComponent } from 'solid-js';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import { useGlobalData } from '@/store';

type Props = {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const DragOverlay: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const [isDragActive, setIsDragActive] = createSignal(false);
    const [filesCount, setFilesCount] = createSignal(0);

    onMount(() => {
        const dropListener = listen<Extract<DragDropEvent, { type: 'drop' }>>(
            TauriEvent.DRAG_DROP,
            (e) => {
                setIsDragActive(false);

                if (e.payload.paths.length === 0) return;

                toast.promise(commands.utilDropFiles(e.payload.paths), {
                    loading: `Processing ${filesCount()} file(s)`,
                    success: (e) => {
                        if (e.status === 'ok') {
                            globalData.resources.images.refetch();
                            globalData.resources.videos.refetch();
                            globalData.resources.audio.refetch();
                            globalData.resources.generalStats.refetch();

                            return `File(s) processed: ${e.data}`;
                        } else return `Processing error: ${e.error}`;
                    },
                    error: 'Failed to process file(s)',
                });
            },
        );

        const dragEnterListener = listen<
            Extract<DragDropEvent, { type: 'enter' }>
        >(TauriEvent.DRAG_ENTER, (e) => {
            setIsDragActive(true);
            setFilesCount(e.payload.paths.length);
        });

        const dragLeaveListener = listen<
            Extract<DragDropEvent, { type: 'leave' }>
        >(TauriEvent.DRAG_LEAVE, () => {
            setIsDragActive(false);
        });

        onCleanup(() => {
            dropListener.then((unlisten) => unlisten());
            dragEnterListener.then((unlisten) => unlisten());
            dragLeaveListener.then((unlisten) => unlisten());
        });
    });

    return (
        <Portal>
            <div
                class={clsx(
                    'pointer-events-none fixed inset-0 z-50 flex scale-150 items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-150',
                    { 'pointer-events-none opacity-0': !isDragActive() },
                )}
                ref={props.ref}
            >
                <div class='flex flex-col items-center gap-3 rounded-xl border-2 border-white/40 border-dashed bg-white/10 px-13 py-10 text-white shadow-xl'>
                    <p>Drop {filesCount()} file(s) here</p>
                </div>
            </div>
        </Portal>
    );
};
