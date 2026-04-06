import {
    type Accessor,
    createContext,
    type Setter,
    useContext,
} from 'solid-js';

export const DropdownMenuContext = createContext<{
    isOpen: Accessor<boolean>;
    onOpenChange: (open: boolean) => void;
    closeMenu: () => void;
    triggerRef: Accessor<HTMLButtonElement | undefined>;
    setTriggerRef: Setter<HTMLButtonElement | undefined>;
}>();

export const useDropdownMenuContext = () => {
    const context = useContext(DropdownMenuContext);

    if (!context) {
        throw new Error(
            'useContext must be used within the correct context provider',
        );
    }

    return context;
};
