import { type JSX, Show } from 'solid-js';

import { cn } from '@/utils';

type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    label?: JSX.Element;
    disabled?: boolean;
    class?: string;
    trackClass?: string;
    thumbClass?: string;
};

export const ToggleSwitch = (props: Props) => {
    const handleToggle = () => {
        if (props.disabled) return;

        props.onChange(!props.checked);
    };

    return (
        <div
            aria-checked={props.checked}
            aria-disabled={props.disabled}
            class={cn(
                'flex flex-row items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                props.disabled && 'opacity-60',
                props.class,
            )}
            onClick={handleToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleToggle();
                }
            }}
            role='switch'
            tabIndex={0}
        >
            <div
                class={cn(
                    'flex h-5 w-9 cursor-pointer items-center rounded-full border border-neutral-600 bg-neutral-600/30 p-0.5 transition-colors',
                    props.checked && 'border-blue-600 bg-blue-500',
                    props.disabled && 'cursor-auto',
                    props.trackClass,
                )}
            >
                <div
                    class={cn(
                        'h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out',
                        props.checked && 'translate-x-4',
                        props.thumbClass,
                    )}
                />
            </div>
            <Show when={props.label}>
                <span class='select-none text-sm'>{props.label}</span>
            </Show>
        </div>
    );
};
