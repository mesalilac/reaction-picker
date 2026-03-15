import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { openUrl } from '@tauri-apps/plugin-opener';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Snippet } from '@/bindings';
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
    snippet: Snippet;
};

export const SnippetCard: VoidComponent<Props> = (props) => {
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
        const res = await commands
            .utilCopySnippet(props.snippet.id)
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

        toast.success('Snippet copied to clipboard');

        globalData.resources.snippets.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.snippet.id ? res.data : item,
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
        if (!props.snippet.externalLink) {
            toast.error('Snippet has no external link');
            return;
        }

        await openUrl(props.snippet.externalLink).catch((e) => toast.error(e));

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
                <Show when={containerVisible()}>
                    <textarea
                        class='pointer-events-none h-full w-full select-none resize-none overflow-hidden rounded-lg text-neutral-400 focus:outline-none'
                        readOnly
                        textContent={props.snippet.content}
                    />
                </Show>
            </div>
            <div class='flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                    <span class='truncate'>{props.snippet.title}</span>
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
                                <Show when={props.snippet.externalLink}>
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
