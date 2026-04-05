import gsap from 'gsap';
import { createEffect, type JSX, onCleanup } from 'solid-js';

import { Popover } from '@/ui';

import { useDropdownMenuContext } from './context';

type Props = {
    children: JSX.Element;
};

export const Content = (props: Props) => {
    let divRef: HTMLDivElement | undefined;

    const ctx = useDropdownMenuContext();

    createEffect(() => {
        if (ctx.isOpen() && divRef) {
            const gsapCtx = gsap.context(() => {
                gsap.from(divRef, {
                    autoAlpha: 0,
                    duration: 0.2,
                    height: 0,
                    overflow: 'hidden',
                    ease: 'power2.in',
                });
            });

            onCleanup(() => gsapCtx.revert());
        }
    });

    return (
        <Popover
            onOpenChange={ctx.setIsOpen}
            open={ctx.isOpen()}
            positionTryFallbacks={() => ['block-start span-inline-end']}
            targetPositionArea='block-end span-inline-end'
            triggerElement={ctx.triggerRef()}
        >
            <div
                class='mt-1 mb-1 min-w-30 rounded-lg border border-neutral-600 bg-neutral-800 p-2 text-white shadow-2xl shadow-black'
                ref={divRef}
            >
                {props.children}
            </div>
        </Popover>
    );
};
