import { cn } from 'cronus-ui';
import { gsap } from 'gsap';
import { createEffect, type JSX, mergeProps, onCleanup } from 'solid-js';

import { Popover, type PopoverProps } from '@/ui';

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

    let divRef!: HTMLDivElement;

    const ctx = useSelectContext();

    createEffect(() => {
        if (ctx.isOpen() && divRef) {
            const gsapCtx = gsap.context(() => {
                gsap.from(divRef, {
                    autoAlpha: 0,
                    duration: 0.2,
                    height: 0,
                    overflow: 'hidden',
                    ease: 'power3.out',
                });
            });

            onCleanup(() => gsapCtx.revert());
        }
    });

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
                ref={divRef}
                style={{
                    'min-width': triggerWidth(),
                }}
            >
                {props.children}
            </div>
        </Popover>
    );
};
