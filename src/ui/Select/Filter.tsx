import type { JSX } from 'solid-js';

import { Separator } from '@/ui';
import { cn } from '@/utils';

export type Props = {
    class?: string;
    children: JSX.Element;
};

export const Filter = (props: Props) => {
    return (
        <div class={cn('flex flex-col gap-1 p-2', props.class)}>
            {props.children}
            <Separator class='my-2 border-neutral-700' />
        </div>
    );
};
