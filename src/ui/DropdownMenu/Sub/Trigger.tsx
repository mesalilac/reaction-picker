import { cn } from 'cronus-ui';
import type { JSX } from 'solid-js';

import { IconArrowChevronRight } from '@/icons';
import { Button } from '@/ui';

import { useSubMenuContext } from './context';

type Props = {
    class?: string;
    children: JSX.Element;
};

export const Trigger = (props: Props) => {
    const ctx = useSubMenuContext();

    let openTimer: number | undefined;

    const handleMouseEnter = async () => {
        openTimer = await setTimeout(() => ctx.setIsOpen(true), 150);
    };

    const handleMouseLeave = async () => {
        clearTimeout(openTimer);

        const timer = await setTimeout(() => {
            ctx.setIsOpen(false);
        }, 150);

        ctx.setCloseTimer(timer);
    };

    return (
        <Button
            aria-expanded={ctx.isOpen()}
            aria-haspopup='listbox'
            class={cn(
                'w-full select-none justify-between text-nowrap text-neutral-200 capitalize',
                props.class,
                ctx.isOpen() && 'bg-neutral-700/30',
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={ctx.setTriggerRef}
            role='combobox'
            variant='ghost'
        >
            {props.children}
            <IconArrowChevronRight
                class={cn(
                    'transition-transform duration-150',
                    ctx.isOpen() && 'rotate-90',
                )}
            />
        </Button>
    );
};
