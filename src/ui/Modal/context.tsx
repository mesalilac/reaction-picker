import { createContext, useContext } from 'solid-js';

export type ModalContextData = {
    open?: boolean;
    closeModal: () => void;
};

export const ModalContext = createContext<ModalContextData>();

export const useModalContext = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error('useModalData must be used within a ModalContext');
    }

    return context;
};
