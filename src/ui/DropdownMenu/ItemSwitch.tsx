import type { JSX } from 'solid-js';

import { Button, ToggleSwitch } from '@/ui';
import { cn } from '@/utils';

type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    label?: JSX.Element;
    class?: string;
    children: JSX.Element;
};

export const ItemSwitch = (props: Props) => {
    return (
        <Button
            class={cn(
                'w-full select-none justify-between text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
            )}
            disabled={props.disabled}
            onClick={() => props.onChange(!props.checked)}
            variant='ghost'
        >
            {props.children}
            <ToggleSwitch
                checked={props.checked}
                disabled={props.disabled}
                label={props.label}
                onChange={() => {}}
            />
        </Button>
    );
};
