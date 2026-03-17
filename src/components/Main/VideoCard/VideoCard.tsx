import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import clsx from 'clsx';
import { filesize } from 'filesize';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Video } from '@/bindings';
import {
    Button,
    ButtonIcon,
    CardField,
    IconHeart01,
    IconMoreVertical,
    Menu,
    Popover,
} from '@/components';
import { useGlobalContext } from '@/store';
import { minimizeWindow, unminimizeWindow } from '@/utils';

type Props = {
    video: Video;
};

export const VideoCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let popoverMenuRef!: HTMLButtonElement;
    let containerRef!: HTMLDivElement;

    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);

    const useVisibilityObserver = createVisibilityObserver({
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
    });

    const containerVisible = useVisibilityObserver(() => containerRef);

    const handleToggleFavorite = async () => {
        const res = await commands
            .updateVideo(props.video.id, {
                isFavorite: !props.video.isFavorite,
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

        const res = await commands.utilCopyVideo(props.video.id).catch((e) => {
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

    const handleViewDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleOpenExternalLink = async () => {
        if (!props.video.externalLink) {
            toast.error('Video has no external link');
            return;
        }

        await openUrl(props.video.externalLink).catch((e) => toast.error(e));

        setShowPopoverMenu(false);
    };

    const handleEditDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleRestore = async () => {
        setShowPopoverMenu(false);

        const res = await commands
            .updateRestoreVideo(props.video.id)
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

        toast.success('Video restored successfully');

        globalCtx.resources.videos.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.video.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        setShowPopoverMenu(false);

        const alreadyDeleted = props.video.deletedAt !== null;

        const res = await commands
            .removeDeleteVideo(props.video.id, { permanent: alreadyDeleted })
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
                    <ButtonIcon onClick={handleToggleFavorite}>
                        <IconHeart01
                            class={clsx({
                                'fill-red-500 text-red-500':
                                    props.video.isFavorite,
                            })}
                        />
                    </ButtonIcon>
                    <ButtonIcon ref={popoverMenuRef}>
                        <IconMoreVertical />
                    </ButtonIcon>
                    <Popover
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                        targetPositionArea='bottom center'
                        triggerElement={popoverMenuRef}
                    >
                        <Menu
                            open={showPopoverMenu()}
                            setOpen={setShowPopoverMenu}
                        >
                            <Menu.Item onClick={handleViewDetails}>
                                view details
                            </Menu.Item>
                            <Menu.Item onClick={handleEditDetails}>
                                edit details
                            </Menu.Item>
                            <Show when={props.video.externalLink}>
                                <Menu.Separator />
                                <Menu.Item onClick={handleOpenExternalLink}>
                                    open external link
                                </Menu.Item>
                            </Show>
                            <Menu.Separator />
                            <Show when={props.video.deletedAt !== null}>
                                <Menu.Item
                                    class='text-blue-500'
                                    onClick={handleRestore}
                                >
                                    restore
                                </Menu.Item>
                            </Show>
                            <Menu.Item
                                class='text-red-500'
                                onClick={handleDelete}
                            >
                                {props.video.deletedAt !== null
                                    ? 'permanently delete'
                                    : 'delete'}
                            </Menu.Item>
                        </Menu>
                    </Popover>
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
                                    ?.defaultVolume || 0.1;
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
            <div class='flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                    <CardField label='title'>
                        <span title={props.video.title ?? undefined}>
                            {props.video.title}
                        </span>
                    </CardField>
                    <CardField label='description'>
                        <span title={props.video.description ?? undefined}>
                            {props.video.description}
                        </span>
                    </CardField>
                    <CardField label='file name'>
                        <span title={props.video.fileName ?? undefined}>
                            {props.video.fileName}
                        </span>
                    </CardField>
                    <CardField label='total uses'>
                        <span
                            title={
                                props.video.lastUsedAt
                                    ? new Date(
                                          props.video.lastUsedAt,
                                      ).toLocaleString()
                                    : undefined
                            }
                        >
                            {props.video.useCounter}
                        </span>
                    </CardField>
                    <CardField label='file size'>
                        <span title={props.video.fileSize.toString()}>
                            {filesize(props.video.fileSize)}
                        </span>
                    </CardField>
                    <CardField label='tags'>
                        {props.video.tags.length > 0 ? (
                            <span
                                title={props.video.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            >
                                {props.video.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField
                        label='deleted at'
                        show={props.video.deletedAt !== null}
                    >
                        {props.video.deletedAt ? (
                            <span class='text-red-500'>
                                {new Date(
                                    props.video.deletedAt,
                                ).toLocaleString()}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField label='added at'>
                        {new Date(props.video.createdAt).toLocaleString()}
                    </CardField>
                </div>
            </div>
        </div>
    );
};
