import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';

import { Content } from './Content';
import { DropdownMenuContext } from './context';
import { Item } from './Item';
import { Label } from './Label';
import { MenuSeparator } from './Separator';
import { Trigger } from './Trigger';

type Props = {
    children: JSX.Element;
};

export const DropdownMenu = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >();

    return (
        <DropdownMenuContext.Provider
            value={{ isOpen, setIsOpen, triggerRef, setTriggerRef }}
        >
            {props.children}
        </DropdownMenuContext.Provider>
    );
};

DropdownMenu.Trigger = Trigger;
DropdownMenu.Content = Content;
DropdownMenu.Item = Item;
DropdownMenu.Label = Label;
DropdownMenu.Separator = MenuSeparator;
