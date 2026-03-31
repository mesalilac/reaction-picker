import { createSignal, type JSX, Show } from 'solid-js';

import {
    IconArrowCaretDownMd,
    IconArrowCaretUpMd,
    IconInterfaceCheck,
} from '@/icons';
import { Button, Popover } from '@/ui';
import { cn } from '@/utils';

import { SelectContext, useSelectContext } from './context';

export type Props = {
    onChange: (value: string) => void;
    autoClose?: boolean;
    children: JSX.Element;
};

export const Select = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(false);

    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >(undefined);

    return (
        <SelectContext.Provider
            value={{
                onChange: props.onChange,
                autoClose: props.autoClose,
                isOpen,
                setIsOpen,
                triggerRef: triggerRef,
                setTriggerRef: setTriggerRef,
            }}
        >
            {props.children}
        </SelectContext.Provider>
    );
};

export type SelectTriggerProps = {
    class?: string;
    disabled?: boolean;
    children: JSX.Element;
};

Select.Trigger = (props: SelectTriggerProps) => {
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
            onClick={() => ctx.setIsOpen((prev) => !prev)}
            ref={(el) => ctx.setTriggerRef(el)}
            role='combobox'
            variant='secondary'
        >
            {props.children}
            <Show
                fallback={<IconArrowCaretDownMd size='1.5em' />}
                when={ctx.isOpen()}
            >
                <IconArrowCaretUpMd size='1.5em' />
            </Show>
        </Button>
    );
};

export type SelectMenuProps = {
    class?: string;
    children: JSX.Element;
};

Select.Menu = (props: SelectMenuProps) => {
    const ctx = useSelectContext();

    return (
        <Popover
            onOpenChange={ctx.setIsOpen}
            open={ctx.isOpen()}
            targetPosition='fixed'
            targetPositionArea='bottom center'
            triggerElement={ctx.triggerRef()}
        >
            <div
                class={cn(
                    'p2 flex min-h-80 min-w-80 flex-col overscroll-contain rounded-lg bg-neutral-800 text-inherit',
                    props.class,
                )}
            >
                {props.children}
            </div>
        </Popover>
    );
};

export type SelectOptionProps = {
    value: string;
    selected?: boolean;
    class?: string;
    disabled?: boolean;
    children: JSX.Element;
};

Select.Option = (props: SelectOptionProps) => {
    const ctx = useSelectContext();

    return (
        <Button
            class={cn('justify-between text-nowrap', props.class)}
            disabled={props.disabled}
            onClick={() => {
                ctx.onChange(props.value);

                if (ctx.autoClose) ctx.setIsOpen(false);
            }}
            variant={props.selected ? 'primary' : 'ghost'}
        >
            <div class='flex gap-1'>{props.children}</div>
            <Show when={props.selected}>
                <IconInterfaceCheck />
            </Show>
        </Button>
    );
};
