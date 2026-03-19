import { Show } from 'solid-js';

import { ButtonIcon, IconMoreVertical, Menu, Popover } from '@/components';

type Props = {
    handleViewDetails: () => void;
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
            <ButtonIcon ref={popoverMenuRef}>
                <IconMoreVertical class='size-5' />
            </ButtonIcon>
            <Popover
                onOpenChange={props.onOpenChange}
                open={props.open}
                targetPositionArea='bottom center'
                triggerElement={popoverMenuRef}
            >
                <Menu onOpenChange={props.onOpenChange} open={props.open}>
                    <Menu.Item onClick={props.handleViewDetails}>
                        view details
                    </Menu.Item>
                    <Menu.Item onClick={props.handleEditDetails}>
                        edit details
                    </Menu.Item>
                    <Show when={props.externalLink}>
                        <Menu.Separator />
                        <Menu.Item onClick={props.handleOpenExternalLink}>
                            open external link
                        </Menu.Item>
                    </Show>
                    <Menu.Separator />
                    <Show when={props.deletedAt !== null}>
                        <Menu.Item
                            class='text-blue-500'
                            onClick={props.handleRestore}
                        >
                            restore
                        </Menu.Item>
                    </Show>
                    <Menu.Item
                        class='text-red-500'
                        onClick={props.handleDelete}
                    >
                        {props.deletedAt !== null
                            ? 'permanently delete'
                            : 'delete'}
                    </Menu.Item>
                </Menu>
            </Popover>
        </>
    );
};
