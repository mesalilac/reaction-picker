import { cn } from 'cronus-ui';
import { IconInterfaceCheck } from 'cronus-ui/icons';
import { type JSX, Show } from 'solid-js';

import { Button } from '@/ui';

import { useSelectContext } from './context';

export type Props = {
    value: string;
    class?: string;
    disabled?: boolean;
    selected?: boolean;
    children: JSX.Element;
};

export const Option = (props: Props) => {
    const ctx = useSelectContext();

    const isSelected = props.selected ?? ctx.value() === props.value;

    return (
        <Button
            class={cn('justify-between text-nowrap', props.class)}
            disabled={props.disabled}
            onClick={() => {
                ctx.onChange(props.value);

                if (ctx.autoClose) ctx.setIsOpen(false);
            }}
            variant={isSelected ? 'primary' : 'ghost'}
        >
            <div class='flex gap-1'>{props.children}</div>
            <Show when={isSelected}>
                <IconInterfaceCheck />
            </Show>
        </Button>
    );
};
