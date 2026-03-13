import type { JSX, ParentComponent } from 'solid-js';

type Props = {
    ref?: HTMLSpanElement | ((el: HTMLSpanElement) => void);
    children: JSX.Element;
};

export const Label: ParentComponent<Props> = (props) => {
    return (
        <span
            class='inline-flex items-center justify-center rounded-full bg-neutral-100/10 px-1 font-medium text-neutral-100 text-xs'
            ref={props.ref}
        >
            {props.children}
        </span>
    );
};
