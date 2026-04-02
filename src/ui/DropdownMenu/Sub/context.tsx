import {
    type Accessor,
    createContext,
    type Setter,
    useContext,
} from 'solid-js';

export const SubMenuContext = createContext<{
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    triggerRef: Accessor<HTMLButtonElement | undefined>;
    setTriggerRef: Setter<HTMLButtonElement | undefined>;
}>();

export const useSubMenuContext = () => {
    const context = useContext(SubMenuContext);

    if (!context) {
        throw new Error(
            'useContext must be used within the correct context provider',
        );
    }

    return context;
};
