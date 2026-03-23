import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import clsx from 'clsx';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { type Audio, commands } from '@/bindings';
import { Button, IconButton, IconHeart01 } from '@/components';
import { useGlobalContext } from '@/store';
import {
    handleIpcError,
    handleUnexpectedError,
    minimizeWindow,
    unminimizeWindow,
} from '@/utils';

import { CardInfo } from './CardInfo';
import { CardMenu } from './CardMenu';
import { EditAssetModal } from './EditAssetModal';

type Props = {
    audio: Audio;
};

export const AudioCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let containerRef!: HTMLDivElement;

    const [showEditModal, setShowEditModal] = createSignal(false);
    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);

    const useVisibilityObserver = createVisibilityObserver({
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
    });

    const containerVisible = useVisibilityObserver(() => containerRef);

    const handleToggleFavorite = async () => {
        const res = await commands
            .updateAudio(props.audio.id, {
                isFavorite: !props.audio.isFavorite,
                description: props.audio.description,
                title: props.audio.title,
                externalLink: props.audio.externalLink,
                useCounter: props.audio.useCounter,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });
    };

    const handleCopy = async () => {
        if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
            await minimizeWindow();
        }

        const res = await commands
            .utilCopyAudio(props.audio.id)
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

        toast.success('Audio copied to clipboard');

        globalCtx.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();

        setShowPopoverMenu(true);
    };

    const handleOpenExternalLink = async () => {
        if (!props.audio.externalLink) {
            toast.error('Audio has no external link');
            return;
        }

        await openUrl(props.audio.externalLink).catch(handleUnexpectedError);
    };

    const handleRestore = async () => {
        const res = await commands
            .updateRestoreAudio(props.audio.id)
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success('Audio restored successfully');

        globalCtx.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        const alreadyDeleted = props.audio.deletedAt !== null;

        const res = await commands
            .removeDeleteAudio(props.audio.id, { permanent: alreadyDeleted })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success(
            `Audio ${alreadyDeleted ? 'permanently deleted' : 'deleted'} successfully`,
        );

        globalCtx.resources.audio.mutate((prev) => {
            if (!prev) return;

            if (alreadyDeleted)
                return prev.filter((item) => item.id !== props.audio.id);
            else {
                return prev.map((item) =>
                    item.id === props.audio.id ? res.data : item,
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
                    <IconButton onClick={handleToggleFavorite}>
                        <IconHeart01
                            class={clsx('size-5', {
                                'fill-red-500 text-red-500':
                                    props.audio.isFavorite,
                            })}
                        />
                    </IconButton>
                    <CardMenu
                        deletedAt={props.audio.deletedAt}
                        externalLink={props.audio.externalLink}
                        handleDelete={handleDelete}
                        handleEditDetails={() => setShowEditModal(true)}
                        handleOpenExternalLink={handleOpenExternalLink}
                        handleRestore={handleRestore}
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                    />
                    <Show when={showEditModal()}>
                        <EditAssetModal
                            item={{ type: 'audio', data: props.audio }}
                            onOpenChange={setShowEditModal}
                            onSave={async (store) => {
                                const res = await commands
                                    .updateAudio(props.audio.id, {
                                        title: store.title,
                                        description: store.description,
                                        externalLink: store.externalLink,
                                        useCounter: store.useCounter,
                                        isFavorite: props.audio.isFavorite,
                                        tagIds: store.tagIds,
                                    })
                                    .catch(handleUnexpectedError);

                                if (!res) return;

                                if (res.status === 'error') {
                                    handleIpcError(res.error);

                                    return;
                                }

                                toast.success('Audio updated successfully');

                                globalCtx.resources.audio.mutate((prev) => {
                                    if (!prev) return;

                                    return prev.map((item) =>
                                        item.id === props.audio.id
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
            <div class='w-full self-center'>
                <Show when={containerVisible()}>
                    <audio
                        class='w-full focus:outline-none'
                        controls
                        ref={(el) => {
                            el.volume =
                                globalCtx.resources.settings.get()
                                    ?.defaultVolume || 0.1;
                        }}
                    >
                        <source
                            src={convertFileSrc(props.audio.filePath)}
                            type={props.audio.mimeType}
                        />
                        <track kind='captions' />
                    </audio>
                </Show>
            </div>
            <CardInfo item={props.audio} type='audio' />
        </div>
    );
};
