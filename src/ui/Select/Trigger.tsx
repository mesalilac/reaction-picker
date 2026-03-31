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
            {props.children ?? ctx.value ?? 'Choose an option'}
            <Show
                fallback={<IconArrowCaretDownMd size='1.5em' />}
                when={ctx.isOpen()}
            >
                <IconArrowCaretUpMd size='1.5em' />
            </Show>
        </Button>
    );
};
