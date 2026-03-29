import { createMemo, createSignal, Show, type VoidComponent } from 'solid-js';

import { commands, type Tag } from '@/bindings';
import {
    IconEditPencil01,
    IconInterfaceTag,
    IconInterfaceTrashFull,
} from '@/icons';
import { useGlobalContext } from '@/store';
import { Badge, IconButton } from '@/ui';
import { handleIpcError, handleUnexpectedError } from '@/utils';

import { TagEditModal } from './TagEditModal';

type Props = {
    tag: Tag;
};

export const TagView: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    const [showEditModal, setShowEditModal] = createSignal(false);

    const handleDeleteTag = async () => {
        const res = await commands
            .removeTag(props.tag.id)
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.tags.mutate((prev) => {
            if (!prev) return;

            return prev.filter((item) => item.id !== props.tag.id);
        });

        globalCtx.resources.images.refetch();
        globalCtx.resources.videos.refetch();
        globalCtx.resources.audio.refetch();
        globalCtx.resources.snippets.refetch();
        globalCtx.resources.generalStats.refetch();
    };

    const usageCount = createMemo(() => {
        const imageCount =
            globalCtx.resources.images
                .get()
                ?.filter((x) => x.tags.some((tag) => tag.id === props.tag.id))
                .length || 0;

        const videoCount =
            globalCtx.resources.videos
                .get()
                ?.filter((x) => x.tags.some((tag) => tag.id === props.tag.id))
                .length || 0;

        const audioCount =
            globalCtx.resources.audio
                .get()
                ?.filter((x) => x.tags.some((tag) => tag.id === props.tag.id))
                .length || 0;

        const snippetCount =
            globalCtx.resources.snippets
                .get()
                ?.filter((x) => x.tags.some((tag) => tag.id === props.tag.id))
                .length || 0;

        return imageCount + videoCount + audioCount + snippetCount;
    });

    return (
        <div class='flex items-center justify-between gap-2 rounded-lg bg-neutral-700/50 p-2'>
            <div class='flex items-center gap-2'>
                <IconInterfaceTag />
                <span class='text-neutral-300 text-sm'>{props.tag.name}</span>
                <Badge>{usageCount()}</Badge>
            </div>
            <div class='flex'>
                <IconButton
                    icon={<IconEditPencil01 class='size-5' />}
                    onClick={() => setShowEditModal(true)}
                />
                <Show when={showEditModal()}>
                    <TagEditModal
                        onOpenChange={setShowEditModal}
                        open={showEditModal()}
                        tag={props.tag}
                    />
                </Show>
                <IconButton
                    icon={
                        <IconInterfaceTrashFull class='size-5 text-red-500' />
                    }
                    onClick={handleDeleteTag}
                />
            </div>
        </div>
    );
};
