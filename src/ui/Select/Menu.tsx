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
            positionTryFallbacks={() => ['block-start span-inline-end']}
            targetPosition='fixed'
            targetPositionArea='block-end span-inline-end'
            triggerElement={ctx.triggerRef()}
        >
            <div
                class={cn(
                    'mt-1 mb-1 flex max-h-80 flex-col gap-1 overflow-y-auto overscroll-contain rounded-lg border border-neutral-600 bg-neutral-800 p-2 text-white shadow-2xl shadow-black',
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
