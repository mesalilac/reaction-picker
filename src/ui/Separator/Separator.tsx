import { cn } from 'cronus-ui';
import { type JSX, splitProps, type VoidComponent } from 'solid-js';

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Separator: VoidComponent<Props> = (props) => {
    const [local, others] = splitProps(props, ['class']);

    return (
        <div class={cn('border border-neutral-800', local.class)} {...others} />
    );
};
