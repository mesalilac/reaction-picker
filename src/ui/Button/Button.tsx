import { clsx } from 'clsx';
import {
    type JSX,
    Match,
    mergeProps,
    type ParentComponent,
    Show,
    Switch,
    splitProps,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { Badge } from '@/ui';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'ghost';

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    label?: JSX.Element;
    loading?: boolean;
    children: JSX.Element;
}

export const Button: ParentComponent<Props> = (rawProps) => {
    const props = mergeProps({ variant: 'primary' as ButtonVariant }, rawProps);

    const [local, others] = splitProps(props, [
        'class',
        'disabled',
        'variant',
        'label',
        'loading',
    ]);

    const baseStyles = clsx(
        'box-border flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-4 py-2 font-medium text-sm text-white leading-5 shadow-xs transition-colors duration-100 focus-visible:outline-none focus-visible:ring-4',
    );

    const variantStyles: Record<ButtonVariant, string> = {
        primary: clsx(
            'bg-blue-500/60 hover:bg-blue-600/60 focus-visible:ring-blue-500/50 active:bg-blue-700/60',
        ),
        secondary: clsx(
            'bg-neutral-500/30 text-neutral-300 hover:bg-neutral-600/30 focus-visible:ring-neutral-500/50 active:bg-neutral-700/30',
        ),
        tertiary: clsx(
            'bg-neutral-600/30 text-neutral-300 hover:bg-neutral-700/30 focus-visible:ring-neutral-500/50 active:bg-neutral-800/30',
        ),
        success: clsx(
            'bg-green-500/30 text-green-400 hover:bg-green-600/30 focus-visible:ring-green-500/50 active:bg-green-700/30',
        ),
        danger: clsx(
            'bg-red-500/30 text-red-400 hover:bg-red-600/30 focus-visible:ring-red-500/50 active:bg-red-700/30',
        ),
        warning: clsx(
            'bg-yellow-500/30 text-yellow-400 hover:bg-yellow-600/30 focus-visible:ring-yellow-500/50 active:bg-yellow-700/30',
        ),
        ghost: clsx(
            'bg-transparent hover:bg-neutral-600/30 focus-visible:ring-neutral-600/50 active:bg-neutral-700/30',
        ),
    };

    const disabledButtonStyles =
        ' bg-neutral-500/50 text-neutral-300 opacity-60 pointer-events-none';

    return (
        <Switch>
            <Match when={local.loading}>
                <button
                    class={twMerge(
                        baseStyles,
                        variantStyles[local.variant],
                        disabledButtonStyles,
                        local.class,
                    )}
                    disabled
                    {...others}
                    type='button'
                >
                    <svg
                        aria-hidden='true'
                        class='size-4 animate-spin text-white'
                        fill='none'
                        viewBox='0 0 100 101'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                            fill='#E5E7EB80'
                        />
                        <path
                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                            fill='currentColor'
                        />
                    </svg>
                    Loading...
                </button>
            </Match>

            <Match when={!local.loading}>
                <button
                    class={twMerge(
                        baseStyles,
                        variantStyles[local.variant],
                        local.disabled && disabledButtonStyles,
                        local.class,
                    )}
                    disabled={local.disabled}
                    type='button'
                    {...others}
                >
                    {props.children}
                    <Show when={local.label}>
                        <Badge>{local.label}</Badge>
                    </Show>
                </button>
            </Match>
        </Switch>
    );
};
