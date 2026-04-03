import { type JSX, mergeProps } from 'solid-js';

import { Popover, type PopoverProps } from '@/ui';
import { cn } from '@/utils';

import { useSelectContext } from './context';

export interface Props
    extends Pick<
        PopoverProps,
        'targetPosition' | 'targetPositionArea' | 'positionTryFallbacks'
    > {
    class?: string;
    children: JSX.Element;
}

export const Content = (rawProps: Props) => {
    const props = mergeProps(
        {
            targetPosition: 'fixed',
            targetPositionArea: 'block-end span-inline-end',
            positionTryFallbacks: () => ['block-start span-inline-end'],
        } satisfies Partial<Props>,
        rawProps,
    );

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
            positionTryFallbacks={props.positionTryFallbacks}
            targetPosition={props.targetPosition}
            targetPositionArea={props.targetPositionArea}
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
