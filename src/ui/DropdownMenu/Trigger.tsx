import { cn } from 'cronus-ui';
import { type JSX, mergeProps } from 'solid-js';

import { Button, type ButtonProps } from '@/ui';

import { useDropdownMenuContext } from './context';

interface Props extends Pick<ButtonProps, 'variant' | 'label'> {
    class?: string;
    disabled?: boolean;
    children: JSX.Element;
}

export const Trigger = (rawProps: Props) => {
    const props = mergeProps({ variant: 'secondary' } as Props, rawProps);

    const ctx = useDropdownMenuContext();

    return (
        <Button
            aria-expanded={ctx.isOpen()}
            aria-haspopup='listbox'
            class={cn('px-3 text-white capitalize', props.class)}
            ref={ctx.setTriggerRef}
            role='combobox'
            {...props}
        />
    );
};
