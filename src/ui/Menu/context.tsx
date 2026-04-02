import { createContext, useContext } from 'solid-js';

export const MenuContext = createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>();

export const useMenuContext = () => {
    const context = useContext(MenuContext);

    if (!context) {
        throw new Error(
            'useMenuContext must be used within a MenuContextProvider',
        );
    }

    return context;
};
