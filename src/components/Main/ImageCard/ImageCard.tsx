import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { convertFileSrc } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { decode } from 'blurhash';
import { createSignal, onMount, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Image } from '@/bindings';
import {
    Button,
    ButtonIcon,
    CardField,
    IconMoreVertical,
    Menu,
    Popover,
} from '@/components';
import { useGlobalData } from '@/store';
import { minimizeWindow } from '@/utils';

type Props = {
    image: Image;
};

export const ImageCard: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    let popoverMenuRef!: HTMLButtonElement;
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

    const handleCopy = async () => {
        const res = await commands.utilCopyImage(props.image.id).catch((e) => {
            toast.error(e);
        });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

            return;
        }

        toast.success('Image copied to clipboard');

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

    const handleDelete = () => {
        setShowPopoverMenu(false);
    };

    return (
        <div
            class='flex flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            onContextMenu={handleContextMenu}
            ref={containerRef}
            role='none'
        >
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
                    <CardField label='title'>{props.image.title}</CardField>
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
                                <Show when={props.image.externalLink}>
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
