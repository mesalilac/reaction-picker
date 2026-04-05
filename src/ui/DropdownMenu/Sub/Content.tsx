import { gsap } from 'gsap';
import { createEffect, type JSX, onCleanup } from 'solid-js';

import { Popover } from '@/ui';

import { useSubMenuContext } from './context';

type Props = {
    children: JSX.Element;
};

export const Content = (props: Props) => {
    let divRef: HTMLDivElement | undefined;

    const ctx = useSubMenuContext();

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

    const handleMouseEnter = async () => {
        clearTimeout(ctx.closeTimer());
    };

    const handleMouseLeave = async () => {
        const timer = await setTimeout(() => {
            ctx.setIsOpen(false);
        }, 150);

        ctx.setCloseTimer(timer);
    };

    return (
        <Popover
            onOpenChange={ctx.setIsOpen}
            open={ctx.isOpen()}
            positionTryFallbacks={() => [
                'span-block-start inline-end', // right top
                'span-block-end inline-start', // left bottom
                'span-block-start inline-start', // left top
                'block-start span-inline-end', // top
                'block-end span-inline-end', // bottom
            ]}
            targetPositionArea='span-block-end inline-end' // right bottom
            triggerElement={ctx.triggerRef()}
        >
            <div
                class='mr-2.5 ml-2.5 min-w-30 rounded-lg border border-neutral-600 bg-neutral-800 p-2 text-white shadow-2xl shadow-black'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={divRef}
                role='none'
            >
                {props.children}
            </div>
        </Popover>
    );
};
