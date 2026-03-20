import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { decode } from 'blurhash';
import { clsx } from 'clsx';
import { filesize } from 'filesize';
import { createSignal, onMount, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Image } from '@/bindings';
import { Button, ButtonIcon, CardField, IconHeart01 } from '@/components';
import { useGlobalContext } from '@/store';
import { minimizeWindow, unminimizeWindow } from '@/utils';

import { CardMenu } from './CardMenu';

type Props = {
    image: Image;
};

export const ImageCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let canvasRef!: HTMLCanvasElement;
    let containerRef!: HTMLDivElement;

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
            })
            .catch((e) => {
                toast.error(e);
            });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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

        const res = await commands.utilCopyImage(props.image.id).catch((e) => {
            toast.error(e);
        });

        if (!res) {
            if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
                await unminimizeWindow();
            }

            return;
        }

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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

    const handleViewDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleOpenExternalLink = async () => {
        if (!props.image.externalLink) {
            toast.error('Image has no external link');
            return;
        }

        await openUrl(props.image.externalLink).catch((e) => toast.error(e));

        setShowPopoverMenu(false);
    };

    const handleEditDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleRestore = async () => {
        setShowPopoverMenu(false);

        const res = await commands
            .updateRestoreImage(props.image.id)
            .catch((e) => {
                toast.error(e);
            });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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
        setShowPopoverMenu(false);

        const alreadyDeleted = props.image.deletedAt !== null;

        const res = await commands
            .removeDeleteImage(props.image.id, { permanent: alreadyDeleted })
            .catch((e) => {
                toast.error(e);
            });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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
                    <ButtonIcon onClick={handleToggleFavorite}>
                        <IconHeart01
                            class={clsx('size-5', {
                                'fill-red-500 text-red-500':
                                    props.image.isFavorite,
                            })}
                        />
                    </ButtonIcon>
                    <CardMenu
                        deletedAt={props.image.deletedAt}
                        externalLink={props.image.externalLink}
                        handleDelete={handleDelete}
                        handleEditDetails={handleEditDetails}
                        handleOpenExternalLink={handleOpenExternalLink}
                        handleRestore={handleRestore}
                        handleViewDetails={handleViewDetails}
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                    />
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
            <div class='flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                    <CardField label='title'>
                        <span title={props.image.title ?? undefined}>
                            {props.image.title}
                        </span>
                    </CardField>
                    <CardField label='description'>
                        <span title={props.image.description ?? undefined}>
                            {props.image.description}
                        </span>
                    </CardField>
                    <CardField label='dimensions'>
                        <span
                            title={`${props.image.width}x${props.image.height}`}
                        >
                            {props.image.width}x{props.image.height}
                        </span>
                    </CardField>
                    <CardField label='total uses'>
                        <span
                            title={
                                props.image.lastUsedAt
                                    ? new Date(
                                          props.image.lastUsedAt,
                                      ).toLocaleString()
                                    : undefined
                            }
                        >
                            {props.image.useCounter}
                        </span>
                    </CardField>
                    <CardField label='file size'>
                        <span title={props.image.fileSize.toString()}>
                            {filesize(props.image.fileSize)}
                        </span>
                    </CardField>
                    <CardField label='tags'>
                        {props.image.tags.length > 0 ? (
                            <span
                                title={props.image.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            >
                                {props.image.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField
                        label='deleted at'
                        show={props.image.deletedAt !== null}
                    >
                        {props.image.deletedAt ? (
                            <span class='text-red-500'>
                                {new Date(
                                    props.image.deletedAt,
                                ).toLocaleString()}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField label='added at'>
                        {new Date(props.image.createdAt).toLocaleString()}
                    </CardField>
                </div>
            </div>
        </div>
    );
};
