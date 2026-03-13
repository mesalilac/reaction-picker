import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';
import { commands, type Snippet } from '@/bindings';
import { Button, ButtonIcon, IconMoreVertical, Popover } from '@/components';

type Props = {
    snippet: Snippet;
};

export const SnippetCard: VoidComponent<Props> = (props) => {
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
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();

        setShowPopoverMenu(true);
    };

    const handleViewDetails = () => {};
    const handleOpenExternalLink = () => {};
    const handleEditDetails = () => {};
    const handleDelete = () => {};

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
                        <Button onClick={handleCopy} variant='primary'>
                            Copy
                        </Button>
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
                            <div class='rounded-lg bg-neutral-800 p-1 text-white'>
                                <Button
                                    class='w-full text-nowrap capitalize'
                                    onClick={handleViewDetails}
                                    variant='ghost'
                                >
                                    view details
                                </Button>
                                <Show when={props.snippet.externalLink}>
                                    <Button
                                        class='w-full text-nowrap capitalize'
                                        onClick={handleOpenExternalLink}
                                        variant='ghost'
                                    >
                                        open external link
                                    </Button>
                                </Show>
                                <Button
                                    class='w-full text-nowrap capitalize'
                                    onClick={handleEditDetails}
                                    variant='ghost'
                                >
                                    edit details
                                </Button>
                                <Button
                                    class='w-full text-nowrap text-red-500 capitalize'
                                    onClick={handleDelete}
                                    variant='ghost'
                                >
                                    delete
                                </Button>
                            </div>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
};
