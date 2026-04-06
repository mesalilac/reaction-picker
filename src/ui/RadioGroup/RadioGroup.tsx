import { cn } from 'cronus-ui';
import { createMemo, type JSX, mergeProps, Show } from 'solid-js';

import { RadioGroupContext } from './context';
import { Item } from './Item';

type Props = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    class?: string;
    direction?: 'row' | 'column';
    label?: JSX.Element;
    children: JSX.Element;
};

export const RadioGroup = (rawProps: Props) => {
    const props = mergeProps(
        { direction: 'column' } satisfies Partial<Props>,
        rawProps,
    );
    const value = createMemo(() => props.value);
    const disabled = createMemo(() => props.disabled);

    return (
        <RadioGroupContext.Provider
            value={{
                value: value,
                onChange: props.onChange,
                disabled: disabled,
            }}
        >
            <div class='flex flex-col gap-1'>
                <Show when={props.label}>
                    <div class='flex gap-1 font-bold text-neutral-200 text-sm capitalize'>
                        {props.label}
                    </div>
                </Show>
                <div
                    class={cn(
                        'flex gap-4',
                        props.direction === 'row' ? 'flex-row' : 'flex-col',
                        props.class,
                    )}
                >
                    {props.children}
                </div>
            </div>
        </RadioGroupContext.Provider>
    );
};

RadioGroup.Item = Item;
