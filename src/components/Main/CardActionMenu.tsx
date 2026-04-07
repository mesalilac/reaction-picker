import {
    IconEditPencil01,
    IconEditUndo,
    IconInterfaceExternalLink,
    IconInterfaceTrashFull,
    IconMenuMoreHorizontal,
} from 'cronus-ui/icons';
import { Show } from 'solid-js';

import { DropdownMenu } from '@/ui';

type Props = {
    handleEditDetails: () => void;
    handleOpenExternalLink: () => void;
    handleRestore: () => void;
    handleDelete: () => void;
    externalLink: string | null;
    deletedAt: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const CardActionMenu = (props: Props) => {
    return (
        <DropdownMenu onOpenChange={props.onOpenChange} open={props.open}>
            <DropdownMenu.Trigger variant='icon'>
                <IconMenuMoreHorizontal class='size-5' />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onClick={props.handleEditDetails}>
                    <IconEditPencil01 /> edit details
                </DropdownMenu.Item>
                <Show when={props.externalLink}>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={props.handleOpenExternalLink}>
                        <IconInterfaceExternalLink /> open external link
                    </DropdownMenu.Item>
                </Show>
                <Show when={props.deletedAt !== null}>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={props.handleRestore}>
                        <IconEditUndo /> restore
                    </DropdownMenu.Item>
                </Show>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    class='text-red-500'
                    onClick={props.handleDelete}
                >
                    <IconInterfaceTrashFull />
                    {props.deletedAt !== null ? 'permanently delete' : 'delete'}
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    );
};
