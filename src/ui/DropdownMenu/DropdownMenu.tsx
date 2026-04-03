import type { JSX } from 'solid-js';
import { createComputed, createSignal, on } from 'solid-js';

import { Content } from './Content';
import { DropdownMenuContext } from './context';
import { Item } from './Item';
import { ItemCheckbox } from './ItemCheckbox';
import { ItemSwitch } from './ItemSwitch';
import { Label } from './Label';
import { RadioGroup } from './RadioGroup';
import { MenuSeparator } from './Separator';
import { Sub } from './Sub';
import { Trigger } from './Trigger';

type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: JSX.Element;
};

export const DropdownMenu = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(
        props.open ?? props.defaultOpen ?? false,
    );

    // sync state with props
    createComputed(
        on(
            () => Boolean(props.open),
            (isOpen) => {
                setIsOpen(isOpen);
                props.onOpenChange?.(isOpen);
            },
            { defer: true },
        ),
    );

    const closeMenu = () => {
        if (props.open === undefined) setIsOpen(false);
        props.onOpenChange?.(false);
    };

    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >();

    return (
        <DropdownMenuContext.Provider
            value={{
                isOpen,
                setIsOpen,
                closeMenu,
                triggerRef,
                setTriggerRef,
            }}
        >
            {props.children}
        </DropdownMenuContext.Provider>
    );
};

DropdownMenu.Trigger = Trigger;
DropdownMenu.Content = Content;
DropdownMenu.Item = Item;
DropdownMenu.ItemSwitch = ItemSwitch;
DropdownMenu.ItemCheckbox = ItemCheckbox;
DropdownMenu.Label = Label;
DropdownMenu.Separator = MenuSeparator;

DropdownMenu.Sub = Sub;
DropdownMenu.RadioGroup = RadioGroup;
