import type { JSX } from 'solid-js';

import { Separator } from '@/ui';
import { cn } from '@/utils';

export type Props = {
    class?: string;
    children: JSX.Element;
};

export const Filter = (props: Props) => {
    return (
        <>
            <div
                class={cn(
                    'sticky top-0 flex flex-col gap-1 bg-inherit p-2 pt-4',
                    props.class,
                )}
            >
                {props.children}
            </div>
            <Separator class='my-2 border-neutral-700' />
        </>
    );
};
