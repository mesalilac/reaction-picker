import { cn } from 'cronus-ui';
import type { JSX } from 'solid-js';

import { Separator } from '@/ui';

export type Props = {
    class?: string;
    children: JSX.Element;
};

export const Filter = (props: Props) => {
    return (
        <>
            <div
                class={cn(
                    'sticky top-0 -mt-2 flex flex-col gap-1 bg-inherit p-2',
                    props.class,
                )}
            >
                {props.children}
            </div>
            <Separator class='my-2 border-neutral-700' />
        </>
    );
};
