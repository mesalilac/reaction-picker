import { type JSX, splitProps, type VoidComponent } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Separator: VoidComponent<Props> = (props) => {
    const [local, others] = splitProps(props, ['class']);

    return (
        <div
            class={twMerge('border border-neutral-800', local.class)}
            {...others}
        />
    );
};
