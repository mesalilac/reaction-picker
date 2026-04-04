import type { FlowComponent } from 'solid-js';

import { Button } from '@/ui';
import { cn } from '@/utils';

import { useToggleGroupContext } from './context';

type Props = {
    value: string;
    class?: string;
    disabled?: boolean;
};

export const Item: FlowComponent<Props> = (props) => {
    const ctx = useToggleGroupContext();

    const isSelected = () => ctx.isSelected(props.value);
    const isDisabled = () => ctx.disabled() ?? props.disabled;

    return (
        <Button
            class={cn(
                'rounded-none first:rounded-l-lg last:rounded-r-lg disabled:bg-transparent',
                props.class,
                isSelected() && 'bg-neutral-500/30',
            )}
            disabled={isDisabled()}
            onClick={() => ctx.toggle(props.value)}
            variant='outline'
        >
            {props.children}
        </Button>
    );
};
