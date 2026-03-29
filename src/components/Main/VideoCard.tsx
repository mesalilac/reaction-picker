import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Video } from '@/bindings';
import { FALLBACK_VOLUME } from '@/consts';
import { IconInterfaceHeart01 } from '@/icons';
import { useGlobalContext } from '@/store';
import { Button, IconButton } from '@/ui';
import {
    cn,
    handleIpcError,
    handleUnexpectedError,
    minimizeWindow,
    unminimizeWindow,
} from '@/utils';

import { CardInfo } from './CardInfo';
import { CardMenu } from './CardMenu';
import { EditAssetModal } from './EditAssetModal';

type Props = {
    video: Video;
};

export const VideoCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let containerRef!: HTMLDivElement;

    const [showEditModal, setShowEditModal] = createSignal(false);
    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);

    const useVisibilityObserver = createVisibilityObserver({
        rootMargin: '6000px 0px 6000px 0px',
        threshold: 0,
    });

    const containerVisible = useVisibilityObserver(() => containerRef);

    const handleToggleFavorite = async () => {
        const res = await commands
            .updateVideo(props.video.id, {
                isFavorite: !props.video.isFavorite,
                description: props.video.description,
                title: props.video.title,
                externalLink: props.video.externalLink,
                useCounter: props.video.useCounter,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.videos.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.video.id ? res.data : item,
            );
        });
    };

    const handleCopy = async () => {
        if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
            await minimizeWindow();
        }

        const res = await commands
            .utilCopyVideo(props.video.id)
            .catch(handleUnexpectedError);

        if (!res) {
            if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
                await unminimizeWindow();
            }

            return;
        }

        if (res.status === 'error') {
            handleIpcError(res.error);

            if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
                await unminimizeWindow();
            }

            return;
        }

        toast.success('Video copied to clipboard');

        globalCtx.resources.videos.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.video.id ? res.data : item,
            );
        });
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();

        setShowPopoverMenu(true);
    };

    const handleOpenExternalLink = async () => {
        if (!props.video.externalLink) {
            toast.error('Video has no external link');
            return;
        }

        await openUrl(props.video.externalLink).catch(handleUnexpectedError);
    };

    const handleRestore = async () => {
        const res = await commands
            .updateRestoreVideo(props.video.id)
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success('Video restored successfully');

        globalCtx.resources.videos.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.video.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        const alreadyDeleted = props.video.deletedAt !== null;

        const res = await commands
            .removeDeleteVideo(props.video.id, { permanent: alreadyDeleted })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success(
            `Video ${alreadyDeleted ? 'permanently deleted' : 'deleted'} successfully`,
        );

        globalCtx.resources.videos.mutate((prev) => {
            if (!prev) return;

            if (alreadyDeleted)
                return prev.filter((item) => item.id !== props.video.id);
            else {
                return prev.map((item) =>
                    item.id === props.video.id ? res.data : item,
                );
            }
        });
    };

    return (
        <div
            class='flex flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            onContextMenu={handleContextMenu}
            ref={containerRef}
            role='none'
        >
            <div class='flex flex-row justify-between'>
                <div class='flex flex-row gap-2'>
                    <Button onClick={handleCopy}>Copy</Button>
                </div>
                <div class='flex flex-row gap-2'>
                    <IconButton
                        icon={
                            <IconInterfaceHeart01
                                class={cn('size-5', {
                                    'fill-red-500 text-red-500':
                                        props.video.isFavorite,
                                })}
                            />
                        }
                        onClick={handleToggleFavorite}
                    />
                    <CardMenu
                        deletedAt={props.video.deletedAt}
                        externalLink={props.video.externalLink}
                        handleDelete={handleDelete}
                        handleEditDetails={() => setShowEditModal(true)}
                        handleOpenExternalLink={handleOpenExternalLink}
                        handleRestore={handleRestore}
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                    />
                    <Show when={showEditModal()}>
                        <EditAssetModal
                            item={{ type: 'video', data: props.video }}
                            onOpenChange={setShowEditModal}
                            onSave={async (store) => {
                                const res = await commands
                                    .updateVideo(props.video.id, {
                                        title: store.title,
                                        description: store.description,
                                        externalLink: store.externalLink,
                                        useCounter: store.useCounter,
                                        isFavorite: props.video.isFavorite,
                                        tagIds: store.tagIds,
                                    })
                                    .catch(handleUnexpectedError);

                                if (!res) return;

                                if (res.status === 'error') {
                                    handleIpcError(res.error);

                                    return;
                                }

                                toast.success('Video updated successfully');

                                globalCtx.resources.videos.mutate((prev) => {
                                    if (!prev) return;

                                    return prev.map((item) =>
                                        item.id === props.video.id
                                            ? res.data
                                            : item,
                                    );
                                });
                            }}
                            open={showEditModal()}
                            title='Edit Image'
                        />
                    </Show>
                </div>
            </div>
            <div class='h-80 w-full self-center'>
                <Show when={containerVisible()}>
                    <video
                        autoplay={!props.video.hasAudio}
                        class='h-full w-full rounded-lg focus:outline-none'
                        controls
                        loop
                        ref={(el) => {
                            el.volume =
                                globalCtx.resources.settings.get()
                                    ?.defaultVolume || FALLBACK_VOLUME;
                        }}
                    >
                        <source
                            src={convertFileSrc(props.video.filePath)}
                            type={props.video.mimeType}
                        />
                        <track kind='captions' />
                    </video>
                </Show>
            </div>
            <CardInfo item={props.video} type='video' />
        </div>
    );
};
