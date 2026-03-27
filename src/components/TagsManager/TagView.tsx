import { createSignal, Show, type VoidComponent } from 'solid-js';

import { commands, type Tag } from '@/bindings';
import {
    IconButton,
    IconEditEditPencil01,
    IconInterfaceTag,
    IconInterfaceTrashFull,
} from '@/components';
import { useGlobalContext } from '@/store';
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

    return (
        <div class='flex items-center justify-between gap-2 rounded-lg bg-neutral-700/50 p-2'>
            <div class='flex items-center gap-2'>
                <IconInterfaceTag />
                <span class='text-neutral-300 text-sm'>{props.tag.name}</span>
            </div>
            <div class='flex'>
                <IconButton
                    icon={<IconEditEditPencil01 class='size-5' />}
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
