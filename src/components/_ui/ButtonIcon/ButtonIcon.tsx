import type { JSX, ParentComponent } from 'solid-js';
import { splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    children: JSX.Element;
}

export const ButtonIcon: ParentComponent<Props> = (props) => {
    const [local, others] = splitProps(props, ['class']);

    return (
        <button
            class={twMerge(
                'box-border flex cursor-pointer items-center gap-1 rounded-lg border border-transparent p-2 font-medium text-sm text-white leading-5 shadow-xs focus-visible:outline-none focus-visible:ring-4',
                local.class,
            )}
            type='button'
            {...others}
        >
            {props.children}
        </button>
    );
};
