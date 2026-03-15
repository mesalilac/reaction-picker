import {
    createContext,
    type JSX,
    type Setter,
    splitProps,
    useContext,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { Button, Separator } from '@/components';

const MenuContext = createContext<{
    open: boolean;
    setOpen: Setter<boolean>;
}>();

const useMenuContext = () => {
    const context = useContext(MenuContext);

    if (!context) {
        throw new Error(
            'useMenuContext must be used within a MenuContextProvider',
        );
    }

    return context;
};

type Props = {
    open: boolean;
    setOpen: Setter<boolean>;
    children: JSX.Element;
};

interface ItemProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: () => void;
    children: JSX.Element;
}

export const Menu = (props: Props) => {
    return (
        <MenuContext.Provider
            value={{ open: props.open, setOpen: props.setOpen }}
        >
            <div class='min-w-40 rounded-lg bg-neutral-800 p-2 text-white'>
                {props.children}
            </div>
        </MenuContext.Provider>
    );
};

Menu.Item = (props: ItemProps) => {
    const menuContext = useMenuContext();

    const [local, others] = splitProps(props, ['class', 'onClick', 'children']);

    const handleClick = () => {
        local.onClick?.();

        menuContext.setOpen(false);
    };

    return (
        <Button
            class={twMerge('w-full text-nowrap capitalize', local.class)}
            onClick={handleClick}
            variant='ghost'
            {...others}
        >
            {local.children}
        </Button>
    );
};

Menu.Separator = () => {
    return <Separator class='-mx-2 my-2 border-neutral-700' />;
};
