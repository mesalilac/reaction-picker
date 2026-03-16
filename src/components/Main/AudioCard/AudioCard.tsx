import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import clsx from 'clsx';
import { filesize } from 'filesize';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { type Audio, commands } from '@/bindings';
import {
    Button,
    ButtonIcon,
    CardField,
    IconHeart01,
    IconMoreVertical,
    Menu,
    Popover,
} from '@/components';
import { useGlobalData } from '@/store';
import { minimizeWindow } from '@/utils';

type Props = {
    audio: Audio;
};

export const AudioCard: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

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
            .updateAudio(props.audio.id, {
                isFavorite: !props.audio.isFavorite,
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

        globalData.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });
    };

    const handleCopy = async () => {
        const res = await commands.utilCopyAudio(props.audio.id).catch((e) => {
            toast.error(e);
        });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

            return;
        }

        toast.success('Audio copied to clipboard');

        globalData.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });

        if (globalData.resources.settings.get()?.minimizeOnCopy) {
            await minimizeWindow();
        }
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();

        setShowPopoverMenu(true);
    };

    const handleViewDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleOpenExternalLink = async () => {
        if (!props.audio.externalLink) {
            toast.error('Audio has no external link');
            return;
        }

        await openUrl(props.audio.externalLink).catch((e) => toast.error(e));

        setShowPopoverMenu(false);
    };

    const handleEditDetails = () => {
        setShowPopoverMenu(false);
    };

    const handleRestore = async () => {
        setShowPopoverMenu(false);

        const res = await commands
            .updateRestoreAudio(props.audio.id)
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

        toast.success('Audio restored successfully');

        globalData.resources.audio.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.audio.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        setShowPopoverMenu(false);

        const alreadyDeleted = props.audio.deletedAt !== null;

        const res = await commands
            .removeDeleteAudio(props.audio.id, { permanent: alreadyDeleted })
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
            `Audio ${alreadyDeleted ? 'permanently deleted' : 'deleted'} successfully`,
        );

        globalData.resources.audio.mutate((prev) => {
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
            <div class='w-full self-center'>
                <Show when={containerVisible()}>
                    <audio
                        class='w-full focus:outline-none'
                        controls
                        ref={(el) => {
                            el.volume =
                                globalData.resources.settings.get()
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
            <div class='flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                    <CardField label='title'>
                        <span title={props.audio.title ?? undefined}>
                            {props.audio.title}
                        </span>
                    </CardField>
                    <CardField label='description'>
                        <span title={props.audio.description ?? undefined}>
                            {props.audio.description}
                        </span>
                    </CardField>
                    <CardField label='file path'>
                        <span title={props.audio.fileName ?? undefined}>
                            {props.audio.fileName}
                        </span>
                    </CardField>
                    <CardField label='total uses'>
                        <span
                            title={
                                props.audio.lastUsedAt
                                    ? new Date(
                                          props.audio.lastUsedAt,
                                      ).toLocaleString()
                                    : undefined
                            }
                        >
                            {props.audio.useCounter}
                        </span>
                    </CardField>
                    <CardField label='file size'>
                        <span title={props.audio.fileSize.toString()}>
                            {filesize(props.audio.fileSize)}
                        </span>
                    </CardField>
                    <CardField label='tags'>
                        {props.audio.tags.length > 0 ? (
                            <span
                                title={props.audio.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            >
                                {props.audio.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField
                        label='deleted at'
                        show={props.audio.deletedAt !== null}
                    >
                        {props.audio.deletedAt ? (
                            <span class='text-red-500'>
                                {new Date(
                                    props.audio.deletedAt,
                                ).toLocaleString()}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField label='added at'>
                        {new Date(props.audio.createdAt).toLocaleString()}
                    </CardField>
                </div>
                <div class='flex flex-row justify-between'>
                    <div class='flex flex-row gap-2'>
                        <Button onClick={handleCopy}>Copy</Button>
                    </div>
                    <div class='flex flex-row gap-2'>
                        <ButtonIcon onClick={handleToggleFavorite}>
                            <IconHeart01
                                class={clsx({
                                    'fill-red-500 text-red-500':
                                        props.audio.isFavorite,
                                })}
                            />
                        </ButtonIcon>
                        <ButtonIcon ref={popoverMenuRef}>
                            <IconMoreVertical />
                        </ButtonIcon>
                        <Popover
                            onOpenChange={setShowPopoverMenu}
                            open={showPopoverMenu()}
                            targetPositionArea='top center'
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
                                <Show when={props.audio.externalLink}>
                                    <Menu.Separator />
                                    <Menu.Item onClick={handleOpenExternalLink}>
                                        open external link
                                    </Menu.Item>
                                </Show>
                                <Menu.Separator />
                                <Show when={props.audio.deletedAt !== null}>
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
                                    {props.audio.deletedAt !== null
                                        ? 'permanently delete'
                                        : 'delete'}
                                </Menu.Item>
                            </Menu>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
};
