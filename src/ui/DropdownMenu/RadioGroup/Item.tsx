import type { JSX } from 'solid-js';

import { Button } from '@/ui';
import { cn } from '@/utils';

import { useRadioGroupContext } from './context';

type Props = {
    value: string;
    disabled?: boolean;
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
        <Button
            class={cn(
                'w-full select-none text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
            )}
            disabled={isDisabled()}
            onClick={handleClick}
            variant='ghost'
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

            {props.children}
        </Button>
    );
};
