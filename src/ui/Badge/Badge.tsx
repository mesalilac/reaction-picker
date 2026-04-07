import type { JSX, ParentComponent } from 'solid-js';

import { cn } from '@/utils';

type Props = {
    ref?: HTMLSpanElement | ((el: HTMLSpanElement) => void);
    class?: string;
    children: JSX.Element;
};

export const Badge: ParentComponent<Props> = (props) => {
    return (
        <span
            class={cn(
                'inline-flex items-center justify-center rounded-full bg-neutral-100/10 px-1 font-medium text-neutral-100 text-xs',
                props.class,
            )}
            ref={props.ref}
        >
            {props.children}
        </span>
    );
};
