import { type JSX, Show } from 'solid-js';

import { Button, Helper } from '@/ui';
import { cn } from '@/utils';

type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    helper?: JSX.Element;
    disabled?: boolean;
    class?: string;
    children: JSX.Element;
};

export const ItemCheckbox = (props: Props) => {
    const handleClick = () => {
        if (props.disabled) return;

        props.onChange(!props.checked);
    };

    return (
        <Button
            class={cn(
                'w-full select-none text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
            )}
            disabled={props.disabled}
            onClick={handleClick}
            variant='ghost'
        >
            <div
                class={cn(
                    'flex size-4 cursor-pointer items-center rounded-sm border transition-colors duration-200 ease-out',
                    props.checked
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-neutral-600',
                )}
            >
                <svg
                    class='size-4 transition-opacity duration-100 ease-in-out'
                    fill='none'
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    style={{
                        opacity: props.checked ? '1' : '0',
                    }}
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <title>Check</title>
                    <path d='M5 12l5 5l10 -10' />
                </svg>
            </div>

            <div class='flex flex-col items-start gap-1'>
                <div class='flex flex-row items-start gap-1'>
                    {props.children}
                </div>

                <Show when={props.helper}>
                    <Helper text={props.helper} />
                </Show>
            </div>
        </Button>
    );
};
