import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { type Audio, commands } from '@/bindings';
import {
    Button,
    ButtonIcon,
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

    const handleDelete = () => {
        setShowPopoverMenu(false);
    };

    return (
        <div
            class='flex h-80 flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            onContextMenu={handleContextMenu}
            ref={containerRef}
            role='none'
        >
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
            <div class='mt-auto flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                    <span class='truncate'>{props.audio.title}</span>
                </div>
                <div class='flex flex-row justify-between'>
                    <div class='flex flex-row gap-2'>
                        <Button onClick={handleCopy}>Copy</Button>
                    </div>
                    <div class='flex flex-row gap-2'>
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
                                <Menu.Item
                                    class='text-red-500'
                                    onClick={handleDelete}
                                >
                                    delete
                                </Menu.Item>
                            </Menu>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
};
