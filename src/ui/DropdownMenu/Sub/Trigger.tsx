import type { JSX } from 'solid-js';

import { IconArrowRightMd } from '@/icons';
import { Button } from '@/ui';
import { cn } from '@/utils';

import { useSubMenuContext } from './context';

type Props = {
    class?: string;
    children: JSX.Element;
};

export const Trigger = (props: Props) => {
    const ctx = useSubMenuContext();

    return (
        <Button
            aria-expanded={ctx.isOpen()}
            aria-haspopup='listbox'
            class={cn(
                'w-full select-none justify-between text-nowrap text-neutral-200 capitalize',
                props.class,
            )}
            ref={ctx.setTriggerRef}
            role='combobox'
            variant='ghost'
        >
            {props.children}
            <IconArrowRightMd />
        </Button>
    );
};
