import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { openUrl } from '@tauri-apps/plugin-opener';
import clsx from 'clsx';
import { filesize } from 'filesize';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Snippet } from '@/bindings';
import { Button, ButtonIcon, CardField, IconHeart01 } from '@/components';
import { useGlobalContext } from '@/store';
import { minimizeWindow, unminimizeWindow } from '@/utils';

import { CardMenu } from './CardMenu';

type Props = {
    snippet: Snippet;
};

export const SnippetCard: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    let containerRef!: HTMLDivElement;

    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);

    const useVisibilityObserver = createVisibilityObserver({
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
    });

    const containerVisible = useVisibilityObserver(() => containerRef);

    const handleToggleFavorite = async () => {
        const res = await commands
            .updateSnippet(props.snippet.id, {
                isFavorite: !props.snippet.isFavorite,
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

        globalCtx.resources.snippets.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.snippet.id ? res.data : item,
            );
        });
    };

    const handleCopy = async () => {
        if (globalCtx.resources.settings.get()?.minimizeOnCopy) {
            await minimizeWindow();
        }

        const res = await commands
            .utilCopySnippet(props.snippet.id)
            .catch((e) => {
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

        toast.success('Snippet copied to clipboard');

        globalCtx.resources.snippets.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.snippet.id ? res.data : item,
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

    const handleRestore = async () => {
        setShowPopoverMenu(false);

        const res = await commands
            .updateRestoreSnippet(props.snippet.id)
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

        toast.success('Snippet restored successfully');

        globalCtx.resources.snippets.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.snippet.id ? res.data : item,
            );
        });
    };

    const handleDelete = async () => {
        setShowPopoverMenu(false);

        const alreadyDeleted = props.snippet.deletedAt !== null;

        const res = await commands
            .removeDeleteSnippet(props.snippet.id, {
                permanent: alreadyDeleted,
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

        toast.success(
            `Snippet ${alreadyDeleted ? 'permanently deleted' : 'deleted'} successfully`,
        );

        globalCtx.resources.snippets.mutate((prev) => {
            if (!prev) return;

            if (alreadyDeleted)
                return prev.filter((item) => item.id !== props.snippet.id);
            else {
                return prev.map((item) =>
                    item.id === props.snippet.id ? res.data : item,
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
                                    props.snippet.isFavorite,
                            })}
                        />
                    </ButtonIcon>
                    <CardMenu
                        deletedAt={props.snippet.deletedAt}
                        externalLink={props.snippet.externalLink}
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
                    <CardField label='title'>
                        <span title={props.snippet.title ?? undefined}>
                            {props.snippet.title}
                        </span>
                    </CardField>
                    <CardField label='description'>
                        <span title={props.snippet.description ?? undefined}>
                            {props.snippet.description}
                        </span>
                    </CardField>
                    <CardField label='total uses'>
                        <span
                            title={
                                props.snippet.lastUsedAt
                                    ? new Date(
                                          props.snippet.lastUsedAt,
                                      ).toLocaleString()
                                    : undefined
                            }
                        >
                            {props.snippet.useCounter}
                        </span>
                    </CardField>
                    <CardField label='length'>
                        <span>{props.snippet.content.length} character(s)</span>
                    </CardField>
                    <CardField label='size'>
                        <span>
                            {filesize(
                                new TextEncoder().encode(props.snippet.content)
                                    .length,
                            )}
                        </span>
                    </CardField>
                    <CardField label='tags'>
                        {props.snippet.tags.length > 0 ? (
                            <span
                                title={props.snippet.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            >
                                {props.snippet.tags
                                    .map((tag) => tag.name)
                                    .join(', ')}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField
                        label='deleted at'
                        show={props.snippet.deletedAt !== null}
                    >
                        {props.snippet.deletedAt ? (
                            <span class='text-red-500'>
                                {new Date(
                                    props.snippet.deletedAt,
                                ).toLocaleString()}
                            </span>
                        ) : undefined}
                    </CardField>
                    <CardField label='added at'>
                        {new Date(props.snippet.createdAt).toLocaleString()}
                    </CardField>
                </div>
            </div>
        </div>
    );
};
