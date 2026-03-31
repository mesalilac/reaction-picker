import { createSignal, type JSX, mergeProps } from 'solid-js';

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
    children: JSX.Element;
};

export const Select = (rawProps: Props) => {
    const props = mergeProps({ autoClose: true } as Props, rawProps);

    const [isOpen, setIsOpen] = createSignal(false);

    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >(undefined);

    return (
        <SelectContext.Provider
            value={{
                onChange: props.onChange,
                autoClose: props.autoClose,
                value: props.value,
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
