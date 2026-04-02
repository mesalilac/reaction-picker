import type { JSX } from 'solid-js';

import { MenuContext } from './context';
import { Item } from './Item';
import { MenuSeparator } from './Separator';
import { SubMenu } from './SubMenu';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: JSX.Element;
};

export const Menu = (props: Props) => {
    return (
        <MenuContext.Provider
            value={{ open: props.open, onOpenChange: props.onOpenChange }}
        >
            <div class='min-w-40 rounded-lg bg-neutral-800 p-2 text-white'>
                {props.children}
            </div>
        </MenuContext.Provider>
    );
};

Menu.SubMenu = SubMenu;
Menu.Item = Item;
Menu.Separator = MenuSeparator;
