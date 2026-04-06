import type { JSX } from 'solid-js';

import { cn } from '@/utils';

type Props = {
    text: JSX.Element;
    class?: string;
};

export const Helper = (props: Props) => {
    return (
        <span class={cn('text-neutral-500/80 text-xs', props.class)}>
            {props.text}
        </span>
    );
};
