import { type JSX, splitProps, type VoidComponent } from 'solid-js';

import { cn } from '@/utils';

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Separator: VoidComponent<Props> = (props) => {
    const [local, others] = splitProps(props, ['class']);

    return (
        <div class={cn('border border-neutral-800', local.class)} {...others} />
    );
};
