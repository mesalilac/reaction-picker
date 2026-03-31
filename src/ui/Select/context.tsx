import {
    type Accessor,
    createContext,
    type Setter,
    useContext,
} from 'solid-js';

export type SelectContext = {
    onChange: (value: string) => void;
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;

    triggerRef: Accessor<HTMLButtonElement | undefined>;
    setTriggerRef: Setter<HTMLButtonElement | undefined>;
};

export const SelectContext = createContext<SelectContext>();

export const useSelectContext = () => {
    const context = useContext(SelectContext);

    if (!context) {
        throw new Error('useSelectContext must be used within a SelectContext');
    }

    return context;
};
