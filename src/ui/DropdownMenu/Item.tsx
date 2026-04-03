import { type JSX, mergeProps } from 'solid-js';

import { Button } from '@/ui';
import { cn } from '@/utils';

import { useDropdownMenuContext } from './context';

type Props = {
    onClick?: () => void;
    class?: string;
    autoClose?: boolean;
    disabled?: boolean;
    children: JSX.Element;
};

export const Item = (rawProps: Props) => {
    const props = mergeProps({ autoClose: true } as Props, rawProps);

    const ctx = useDropdownMenuContext();

    const handleClick = () => {
        if (props.autoClose) ctx.closeMenu();

        props.onClick?.();
    };

    return (
        <Button
            class={cn(
                'w-full select-none text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
            )}
            disabled={props.disabled}
            onClick={handleClick}
            variant='ghost'
        >
            {props.children}
        </Button>
    );
};
