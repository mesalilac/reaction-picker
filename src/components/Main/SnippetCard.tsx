import { createVisibilityObserver } from '@solid-primitives/intersection-observer';
import { openUrl } from '@tauri-apps/plugin-opener';
import clsx from 'clsx';
import { createSignal, Show, type VoidComponent } from 'solid-js';
import { toast } from 'solid-sonner';

import { commands, type Snippet } from '@/bindings';
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
    snippet: Snippet;
};

export const SnippetCard: VoidComponent<Props> = (props) => {
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
            .updateSnippet(props.snippet.id, {
                isFavorite: !props.snippet.isFavorite,
                description: props.snippet.description,
                title: props.snippet.title,
                externalLink: props.snippet.externalLink,
                useCounter: props.snippet.useCounter,
                content: props.snippet.content,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

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

    const handleOpenExternalLink = async () => {
        if (!props.snippet.externalLink) {
            toast.error('Snippet has no external link');
            return;
        }

        await openUrl(props.snippet.externalLink).catch(handleUnexpectedError);
    };

    const handleRestore = async () => {
        const res = await commands
            .updateRestoreSnippet(props.snippet.id)
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

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
        const alreadyDeleted = props.snippet.deletedAt !== null;

        const res = await commands
            .removeDeleteSnippet(props.snippet.id, {
                permanent: alreadyDeleted,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

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
                    <IconButton
                        icon={
                            <IconHeart01
                                class={clsx('size-5', {
                                    'fill-red-500 text-red-500':
                                        props.snippet.isFavorite,
                                })}
                            />
                        }
                        onClick={handleToggleFavorite}
                    />
                    <CardMenu
                        deletedAt={props.snippet.deletedAt}
                        externalLink={props.snippet.externalLink}
                        handleDelete={handleDelete}
                        handleEditDetails={() => setShowEditModal(true)}
                        handleOpenExternalLink={handleOpenExternalLink}
                        handleRestore={handleRestore}
                        onOpenChange={setShowPopoverMenu}
                        open={showPopoverMenu()}
                    />
                    <Show when={showEditModal()}>
                        <EditAssetModal
                            item={{ type: 'snippet', data: props.snippet }}
                            onOpenChange={setShowEditModal}
                            onSave={async (store) => {
                                const res = await commands
                                    .updateSnippet(props.snippet.id, {
                                        title: store.title,
                                        description: store.description,
                                        externalLink: store.externalLink,
                                        useCounter: store.useCounter,
                                        isFavorite: props.snippet.isFavorite,
                                        content: store.content,
                                        tagIds: store.tagIds,
                                    })
                                    .catch(handleUnexpectedError);

                                if (!res) return;

                                if (res.status === 'error') {
                                    handleIpcError(res.error);

                                    return;
                                }

                                toast.success('Snippet updated successfully');

                                globalCtx.resources.snippets.mutate((prev) => {
                                    if (!prev) return;

                                    return prev.map((item) =>
                                        item.id === props.snippet.id
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
            <div class='wrap-break-word pointer-events-none h-32 w-full select-none self-center overflow-hidden whitespace-pre-wrap rounded-lg bg-neutral-800/50 p-2 text-neutral-400'>
                <Show when={containerVisible()}>{props.snippet.content}</Show>
            </div>
            <CardInfo item={props.snippet} type='snippet' />
        </div>
    );
};
