import type { JSX } from 'solid-js';

import { Popover } from '@/ui';

import { useDropdownMenuContext } from './context';

type Props = {
    children: JSX.Element;
};

export const Content = (props: Props) => {
    const ctx = useDropdownMenuContext();

    return (
        <Popover
            onOpenChange={ctx.setIsOpen}
            open={ctx.isOpen()}
            targetPositionArea='block-end span-inline-end'
            triggerElement={ctx.triggerRef()}
        >
            <div class='mt-1 min-w-30 rounded-lg bg-neutral-800 p-2 text-white'>
                {props.children}
            </div>
        </Popover>
    );
};
