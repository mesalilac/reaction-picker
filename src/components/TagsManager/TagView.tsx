import { createSignal, Show, type VoidComponent } from 'solid-js';

import { commands, type Tag } from '@/bindings';
import {
    IconButton,
    IconEditEditPencil01,
    IconInterfaceTag,
    IconInterfaceTrashFull,
} from '@/components';

import { TagEditModal } from './TagEditModal';

type Props = {
    tag: Tag;
};

export const TagView: VoidComponent<Props> = (props) => {
    const [showEditModal, setShowEditModal] = createSignal(false);

    const handleDeleteTag = async () => {};

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
