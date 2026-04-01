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

    const triggerWidth = (): string => {
        const ref = ctx.triggerRef();

        if (ref) return `${ref.getBoundingClientRect().width}px`;

        return 'auto';
    };

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
                    'mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto overscroll-contain rounded-lg bg-neutral-800 p-2 text-inherit',
                    props.class,
                )}
                style={{
                    'min-width': triggerWidth(),
                }}
            >
                {props.children}
            </div>
        </Popover>
    );
};
