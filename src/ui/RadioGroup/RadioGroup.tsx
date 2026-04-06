import { createMemo, type JSX, mergeProps } from 'solid-js';

import { cn } from '@/utils';

import { RadioGroupContext } from './context';
import { Item } from './Item';

type Props = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    class?: string;
    direction?: 'row' | 'column';
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
            <div
                class={cn(
                    'flex gap-4',
                    props.direction === 'row' ? 'flex-row' : 'flex-col',
                    props.class,
                )}
            >
                {props.children}
            </div>
        </RadioGroupContext.Provider>
    );
};

RadioGroup.Item = Item;
