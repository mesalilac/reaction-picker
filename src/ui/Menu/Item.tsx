import type { JSX } from 'solid-js';

import { Button } from '@/ui';
import { cn } from '@/utils';

import { useMenuContext } from './context';

type Props = {
    onClick?: () => void;
    class?: string;
    children: JSX.Element;
};

export const Item = (props: Props) => {
    const menuContext = useMenuContext();

    const handleClick = () => {
        menuContext.onOpenChange(false);

        props.onClick?.();
    };

    return (
        <Button
            class={cn('w-full text-nowrap capitalize', props.class)}
            onClick={handleClick}
            variant='ghost'
        >
            {props.children}
        </Button>
    );
};
