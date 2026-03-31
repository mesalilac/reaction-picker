import { createContext, useContext } from 'solid-js';

export type SelectContext = {
    onChange: (value: string) => void;
};

export const SelectContext = createContext<SelectContext>();

export const useSelectContext = () => {
    const context = useContext(SelectContext);

    if (!context) {
        throw new Error('useModalData must be used within a ModalContext');
    }

    return context;
};
