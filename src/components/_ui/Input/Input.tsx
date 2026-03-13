import { type JSX, splitProps, type VoidComponent } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export const Input: VoidComponent<Props> = (props) => {
    const [local, others] = splitProps(props, ['class']);

    return (
        <input
            class={twMerge(
                'rounded-lg border border-neutral-600 border-none bg-neutral-700/50 px-3 py-2.5 text-sm shadow-xs placeholder:text-neutral-500 focus:border-none focus:outline-2 focus:outline-blue-500',
                local.class,
            )}
            {...others}
        />
    );
};
