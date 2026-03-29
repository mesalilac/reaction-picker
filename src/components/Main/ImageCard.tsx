import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { decode } from 'blurhash';
import { createSignal, onMount, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Image } from '@/bindings';
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
    image: Image;
};

export const ImageCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let canvasRef!: HTMLCanvasElement;
    let containerRef!: HTMLDivElement;

    const [showEditModal, setShowEditModal] = createSignal(false);
    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);
    const [loaded, setLoaded] = createSignal(false);

    const useVisibilityObserver = createVisibilityObserver({
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
    });

    const containerVisible = useVisibilityObserver(() => containerRef);

    onMount(() => {
        if (canvasRef) {
            const ratio = props.image.height / props.image.width;

            const width = 32;
            const height = Math.round(width * ratio);

            canvasRef.width = width;
            canvasRef.height = height;

            const image = decode(props.image.blurHash, width, height);
            const ctx = canvasRef.getContext('2d');
            if (!ctx) return;

            const imageData = ctx.createImageData(width, height);
            if (!imageData) return;

            imageData.data.set(image);
            ctx.putImageData(imageData, 0, 0);
        }
    });

    const handleToggleFavorite = async () => {
        const res = await commands
            .updateImage(props.image.id, {
                isFavorite: !props.image.isFavorite,
                description: props.image.description,
                title: props.image.title,
                externalLink: props.image.externalLink,
                useCounter: props.image.useCounter,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.images.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.image.id ? res.data : item,
            );
        });
    };

    const handleCopy = async () => {
        if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
            await minimizeWindow();
        }

        const res = await commands
            .utilCopyImage(props.image.id)
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

        toast.success('Image copied to clipboard');

        globalCtx.resources.images.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.image.id ? res.data : item,
            );
        });
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();

        setShowPopoverMenu(true);
    };

    const handleOpenExternalLink = async () => {
        if (!props.image.externalLink) {
            toast.error('Image has no external link');
            return;
        }

        await openUrl(props.image.externalLink).catch(handleUnexpectedError);
    };

    const handleRestore = async () => {
        const res = await commands
            .updateRestoreImage(props.image.id)
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success('Image restored successfully');

        globalCtx.resources.images.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.image.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        const alreadyDeleted = props.image.deletedAt !== null;

        const res = await commands
            .removeDeleteImage(props.image.id, { permanent: alreadyDeleted })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success(
            `Image ${alreadyDeleted ? 'permanently deleted' : 'deleted'} successfully`,
        );

        globalCtx.resources.images.mutate((prev) => {
            if (!prev) return;

            if (alreadyDeleted)
                return prev.filter((item) => item.id !== props.image.id);
            else {
                return prev.map((item) =>
                    item.id === props.image.id ? res.data : item,
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
                                        props.image.isFavorite,
                                })}
                            />
                        }
                        onClick={handleToggleFavorite}
                    />
                    <CardMenu
                        deletedAt={props.image.deletedAt}
                        externalLink={props.image.externalLink}
                        handleDelete={handleDelete}
                        handleEditDetails={() => setShowEditModal(true)}
                        handleOpenExternalLink={handleOpenExternalLink}
                        handleRestore={handleRestore}
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                    />
                    <Show when={showEditModal()}>
                        <EditAssetModal
                            item={{ type: 'image', data: props.image }}
                            onOpenChange={setShowEditModal}
                            onSave={async (store) => {
                                const res = await commands
                                    .updateImage(props.image.id, {
                                        title: store.title,
                                        description: store.description,
                                        externalLink: store.externalLink,
                                        useCounter: store.useCounter,
                                        isFavorite: props.image.isFavorite,
                                        tagIds: store.tagIds,
                                    })
                                    .catch(handleUnexpectedError);

                                if (!res) return;

                                if (res.status === 'error') {
                                    handleIpcError(res.error);

                                    return;
                                }

                                toast.success('Image updated successfully');

                                globalCtx.resources.images.mutate((prev) => {
                                    if (!prev) return;

                                    return prev.map((item) =>
                                        item.id === props.image.id
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
                <Show when={!loaded()}>
                    <canvas class='h-full w-full' ref={canvasRef}></canvas>
                </Show>
                <Show when={containerVisible()}>
                    <img
                        aria-label={props.image.title || 'Image'}
                        class='h-full w-full object-contain'
                        draggable={false}
                        onLoad={() => setLoaded(true)}
                        src={convertFileSrc(props.image.filePath)}
                        style={{
                            display: loaded() ? 'block' : 'none',
                        }}
                    />
                </Show>
            </div>
            <CardInfo item={props.image} type='image' />
        </div>
    );
};
