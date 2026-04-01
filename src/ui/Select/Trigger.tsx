import { type JSX, Show } from 'solid-js';

import { IconArrowCaretDownMd, IconArrowCaretUpMd } from '@/icons';
import { Button } from '@/ui';
import { cn } from '@/utils';

import { useSelectContext } from './context';

export type Props = {
    class?: string;
    disabled?: boolean;
    children?: JSX.Element;
};

export const Trigger = (props: Props) => {
    const ctx = useSelectContext();

    return (
        <Button
            aria-expanded={ctx.isOpen()}
            aria-haspopup='listbox'
            class={cn(
                'justify-between border-2 px-3 text-white capitalize',
                props.class,
            )}
            disabled={props.disabled}
            ref={ctx.setTriggerRef}
            role='combobox'
            variant='secondary'
        >
            <div class='flex flex-row gap-2'>
                {props.children ?? (ctx.value() || 'Choose an option')}
            </div>
            <div class='flex flex-col'>
                <IconArrowCaretUpMd class='-mb-2' />
                <IconArrowCaretDownMd />
            </div>
        </Button>
    );
};
