import type { JSX } from 'solid-js';

import { IconArrowRightMd } from '@/icons';
import { Button } from '@/ui';
import { cn } from '@/utils';

type Props = {
    class?: string;
    label: JSX.Element;
    children: JSX.Element;
};

export const SubMenu = (props: Props) => {
    const handleClick = () => {};

    return (
        <Button
            class={cn(
                'w-full justify-between text-nowrap capitalize',
                props.class,
            )}
            onClick={handleClick}
            variant='ghost'
        >
            <div class='flex flex-row items-center gap-2'>{props.label}</div>
            <IconArrowRightMd />
        </Button>
    );
};
