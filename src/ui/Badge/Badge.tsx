import type { JSX, ParentComponent } from 'solid-js';
import { twMerge } from 'tailwind-merge';

type Props = {
    ref?: HTMLSpanElement | ((el: HTMLSpanElement) => void);
    class?: string;
    children: JSX.Element;
};

export const Badge: ParentComponent<Props> = (props) => {
    return (
        <span
            class={twMerge(
                'inline-flex items-center justify-center rounded-full bg-neutral-100/10 px-1 font-medium text-neutral-100 text-xs',
                props.class,
            )}
            ref={props.ref}
        >
            {props.children}
        </span>
    );
};
