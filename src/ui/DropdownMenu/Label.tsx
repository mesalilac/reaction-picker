import type { JSX } from 'solid-js';

import { cn } from '@/utils';

type Props = {
    class?: string;
    children: JSX.Element;
};

export const Label = (props: Props) => {
    return (
        <span class={cn('px-4 py-2 font-bold text-sm', props.class)}>
            {props.children}
        </span>
    );
};
