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
                    'size-2 rounded-full border transition-colors duration-100 ease-in-out',
                    isSelected()
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-neutral-600',
                )}
            />

            {props.children}
        </Button>
    );
};
