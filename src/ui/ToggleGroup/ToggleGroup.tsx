import { cn } from 'cronus-ui';
import { createMemo, type JSX } from 'solid-js';

import { ToggleGroupContext } from './context';
import { Item } from './Item';

type SingleProps = {
    type: 'single';
    value: string;
    onChange: (value: string) => void;
};

type MultipleProps = {
    type: 'multiple';
    value: string[];
    onChange: (value: string[]) => void;
};

type BaseProps = {
    class?: string;
    disabled?: boolean;
    children: JSX.Element;
};

type Props = BaseProps & (SingleProps | MultipleProps);

export const ToggleGroup = (props: Props) => {
    const disabled = () => createMemo(() => props.disabled);

    const isSelected = (value: string): boolean => {
        if (props.type === 'single') return props.value === value;

        return props.value.includes(value) ?? false;
    };

    const toggle = (value: string) => {
        if (props.type === 'single') {
            props.onChange(value);
            return;
        }

        const current = props.value;
        const exists = current.includes(value);

        const next = exists
            ? current.filter((v) => v !== value)
            : [...current, value];

        props.onChange(next);
    };

    return (
        <ToggleGroupContext.Provider
            value={{
                isSelected: isSelected,
                toggle: toggle,
                disabled: disabled(),
            }}
        >
            <div class={cn('flex flex-row', props.class)}>{props.children}</div>
        </ToggleGroupContext.Provider>
    );
};

ToggleGroup.Item = Item;
