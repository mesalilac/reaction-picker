import { cn } from 'cronus-ui';
import { type JSX, Show } from 'solid-js';

import { Helper } from '@/ui';

import { useRadioGroupContext } from './context';

type Props = {
    value: string;
    disabled?: boolean;
    helper?: JSX.Element;
    onSelect?: () => void;
    class?: string;
    children: JSX.Element;
};

export const Item = (props: Props) => {
    const ctx = useRadioGroupContext();

    const isSelected = () => ctx.value() === props.value;
    const isDisabled = () => ctx.disabled() ?? props.disabled;

    const handleClick = () => {
        if (!isDisabled()) {
            ctx.onChange(props.value);
            props.onSelect?.();
        }
    };

    return (
        <div
            class={cn(
                'flex select-none flex-row items-center gap-1 text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
                isDisabled() && 'opacity-50',
            )}
            onClick={handleClick}
            role='none'
        >
            <div
                class={cn(
                    'flex size-4 items-center justify-center rounded-full border bg-neutral-600 transition-colors duration-200 ease-in-out',
                    isSelected()
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-neutral-600',
                )}
            >
                <div
                    class='size-2 rounded-full bg-white transition-opacity duration-100 ease-in-out'
                    style={{
                        opacity: isSelected() ? '1' : '0',
                    }}
                />
            </div>

            <div class='flex flex-col items-start gap-1'>
                <div class='flex flex-row items-start gap-1'>
                    {props.children}
                </div>

                <Show when={props.helper}>
                    <Helper text={props.helper} />
                </Show>
            </div>
        </div>
    );
};
