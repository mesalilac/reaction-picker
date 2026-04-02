import { Show } from 'solid-js';

import {
    IconEditPencil01,
    IconEditUndo,
    IconInterfaceExternalLink,
    IconInterfaceTrashFull,
    IconMenuMoreHorizontal,
} from '@/icons';
import { IconButton, Menu, Popover } from '@/ui';

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

export const CardMenu = (props: Props) => {
    let popoverMenuRef!: HTMLButtonElement;

    return (
        <>
            <IconButton
                icon={<IconMenuMoreHorizontal class='size-5' />}
                ref={popoverMenuRef}
            />
            <Popover
                onOpenChange={props.onOpenChange}
                open={props.open}
                targetPositionArea='bottom center'
                triggerElement={popoverMenuRef}
            >
                <Menu onOpenChange={props.onOpenChange} open={props.open}>
                    <Menu.Item onClick={props.handleEditDetails}>
                        <IconEditPencil01 /> edit details
                    </Menu.Item>
                    <Show when={props.externalLink}>
                        <Menu.Separator />
                        <Menu.Item onClick={props.handleOpenExternalLink}>
                            <IconInterfaceExternalLink /> open external link
                        </Menu.Item>
                    </Show>
                    <Menu.Separator />
                    <Menu.SubMenu label='Sub menu'>
                        <Menu.Item>sub menu item</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Separator />
                    <Show when={props.deletedAt !== null}>
                        <Menu.Item onClick={props.handleRestore}>
                            <IconEditUndo /> restore
                        </Menu.Item>
                    </Show>
                    <Menu.Item
                        class='text-red-500'
                        onClick={props.handleDelete}
                    >
                        <IconInterfaceTrashFull />
                        {props.deletedAt !== null
                            ? 'permanently delete'
                            : 'delete'}
                    </Menu.Item>
                </Menu>
            </Popover>
        </>
    );
};
