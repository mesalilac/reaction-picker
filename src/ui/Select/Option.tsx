import { type JSX, Show } from 'solid-js';

import { IconInterfaceCheck } from '@/icons';
import { Button } from '@/ui';
import { cn } from '@/utils';

import { useSelectContext } from './context';

export type Props = {
    value: string;
    selected?: boolean;
    class?: string;
    disabled?: boolean;
    children: JSX.Element;
};

export const Option = (props: Props) => {
    const ctx = useSelectContext();

    const selected = props.selected ?? ctx.value === props.value;

    return (
        <Button
            class={cn('justify-between text-nowrap', props.class)}
            disabled={props.disabled}
            onClick={() => {
                ctx.onChange(props.value);

                if (ctx.autoClose) ctx.setIsOpen(false);
            }}
            variant={selected ? 'primary' : 'ghost'}
        >
            <div class='flex gap-1'>{props.children}</div>
            <Show when={selected}>
                <IconInterfaceCheck />
            </Show>
        </Button>
    );
};
