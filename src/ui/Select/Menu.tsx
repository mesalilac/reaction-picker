import type { JSX } from 'solid-js';

import { Popover } from '@/ui';
import { cn } from '@/utils';

import { useSelectContext } from './context';

export type Props = {
    class?: string;
    children: JSX.Element;
};

export const Menu = (props: Props) => {
    const ctx = useSelectContext();

    return (
        <Popover
            onOpenChange={ctx.setIsOpen}
            open={ctx.isOpen()}
            targetPosition='fixed'
            targetPositionArea='bottom center'
            triggerElement={ctx.triggerRef()}
        >
            <div
                class={cn(
                    'mt-2 flex max-h-80 min-w-80 flex-col gap-1 overflow-y-auto overscroll-contain rounded-lg bg-neutral-800 pr-2 pb-2 pl-2 text-inherit',
                    props.class,
                )}
            >
                {props.children}
            </div>
        </Popover>
    );
};
