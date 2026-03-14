import { listen, TauriEvent } from '@tauri-apps/api/event';
import type { DragDropEvent } from '@tauri-apps/api/window';
import clsx from 'clsx';
import type { VoidComponent } from 'solid-js';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import { toast } from 'solid-sonner';

import { commands, events } from '@/bindings';
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
            async (e) => {
                setIsDragActive(false);

                if (e.payload.paths.length === 0) return;

                const toastId = toast(`Processing ${filesCount()} file(s)`, {
                    duration: Number.POSITIVE_INFINITY,
                });

                events.fileProcessingProgress.listen((processingEvent) => {
                    const current = processingEvent.payload.current;
                    const total = processingEvent.payload.total;

                    toast.loading(`Processed ${current}/${total} file(s)`, {
                        id: toastId,
                    });
                });

                const res = await commands
                    .utilDropFiles(e.payload.paths)
                    .catch((e) => {
                        toast.error(e);
                        toast.dismiss(toastId);
                    });

                if (!res) return;

                if (res.status === 'error') {
                    toast.error(res.error.kind, {
                        description: res.error.message,
                        id: toastId,
                    });
                    toast.dismiss(toastId);

                    return;
                }

                globalData.resources.images.refetch();
                globalData.resources.videos.refetch();
                globalData.resources.audio.refetch();
                globalData.resources.generalStats.refetch();

                toast.success(`File(s) processed: ${res.data}`, {
                    id: toastId,
                });

                toast.dismiss(toastId);
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
