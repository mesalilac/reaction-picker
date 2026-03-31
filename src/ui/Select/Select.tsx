import {
    createMemo,
    createSignal,
    type JSX,
    mergeProps,
    onMount,
} from 'solid-js';

import { SelectContext } from './context';
import { Filter } from './Filter';
import { Menu } from './Menu';
import { Option } from './Option';
import { OptionGroup } from './OptionGroup';
import { Searchbar } from './Searchbar';
import { Trigger } from './Trigger';

export type Props = {
    onChange: (value: string) => void;
    /**
     * @default true
     */
    autoClose?: boolean;
    value?: string;
    /** Enables persistence of the selected value after refresh */
    persistKey?: string;
    children: JSX.Element;
};

const getItemKey = (persistKey: string | undefined): string | undefined => {
    const key = persistKey?.trim().toLocaleUpperCase();
    if (!persistKey) return;

    return `SELECT_MENU_${key}`;
};

export const Select = (rawProps: Props) => {
    const props = mergeProps({ autoClose: true } as Props, rawProps);

    const [isOpen, setIsOpen] = createSignal(false);

    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >(undefined);

    onMount(() => {
        const itemKey = getItemKey(props.persistKey);
        if (!itemKey) return;

        const value = localStorage.getItem(itemKey);
        if (!value) return;

        props.onChange(value);
    });

    const onChange = (value: string) => {
        const itemKey = getItemKey(props.persistKey);
        if (itemKey) localStorage.setItem(itemKey, value);

        props.onChange(value);
    };

    const value = createMemo(() => props.value);

    return (
        <SelectContext.Provider
            value={{
                onChange,
                autoClose: props.autoClose,
                value,
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

Select.Trigger = Trigger;
Select.Menu = Menu;
Select.OptionGroup = OptionGroup;
Select.Option = Option;
Select.Filter = Filter;
Select.Searchbar = Searchbar;
