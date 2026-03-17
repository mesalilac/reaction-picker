import { listen, TauriEvent } from '@tauri-apps/api/event';
import type { DragDropEvent } from '@tauri-apps/api/window';
import clsx from 'clsx';
import type { VoidComponent } from 'solid-js';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import { toast } from 'solid-sonner';

import { commands, events } from '@/bindings';
import { useGlobalContext } from '@/store';

type Props = {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const DragOverlay: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    const [isDragActive, setIsDragActive] = createSignal(false);
    const [filesCount, setFilesCount] = createSignal(0);
    const [processingFiles, setProcessingFiles] = createSignal(false);

    onMount(() => {
        const dropListener = listen<Extract<DragDropEvent, { type: 'drop' }>>(
            TauriEvent.DRAG_DROP,
            async (e) => {
                setIsDragActive(false);

                if (processingFiles()) {
                    toast.error('Files are being processed. Please wait.');
                    return;
                }

                setProcessingFiles(true);

                if (e.payload.paths.length === 0) return;

                const toastId = toast('Processing file(s)...', {
                    duration: Number.POSITIVE_INFINITY,
                });

                const progressUnlisten =
                    await events.fileProcessingProgress.listen(
                        (processingEvent) => {
                            const current = processingEvent.payload.current;
                            const total = processingEvent.payload.total;

                            toast.loading(
                                `Processed ${current}/${total} file(s)`,
                                {
                                    id: toastId,
                                },
                            );
                        },
                    );

                const res = await commands
                    .utilDropFiles(e.payload.paths)
                    .catch((e) => {
                        toast.error(e);
                        setProcessingFiles(false);
                        toast.dismiss(toastId);
                    });

                if (!res) return;

                if (res.status === 'error') {
                    toast.error(res.error.kind, {
                        description: res.error.message,
                        id: toastId,
                    });
                    setProcessingFiles(false);
                    toast.dismiss(toastId);

                    return;
                }

                globalCtx.resources.images.refetch();
                globalCtx.resources.videos.refetch();
                globalCtx.resources.audio.refetch();
                globalCtx.resources.generalStats.refetch();

                toast.success(`File(s) processed: ${res.data}`, {
                    id: toastId,
                });

                setProcessingFiles(false);
                progressUnlisten();
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
