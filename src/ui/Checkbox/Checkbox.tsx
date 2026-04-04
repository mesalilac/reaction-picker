import type { JSX, VoidComponent } from 'solid-js';

import { cn } from '@/utils';

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: JSX.Element;
};

export const Checkbox: VoidComponent<Props> = (props) => {
    return (
        <div
            class='flex select-none items-center gap-2'
            onClick={() => props.onChange(!props.checked)}
            role='none'
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
            {props.label}
        </div>
    );
};
