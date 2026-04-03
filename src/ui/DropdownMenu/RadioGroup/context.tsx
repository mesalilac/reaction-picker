import { type Accessor, createContext, useContext } from 'solid-js';

export const RadioGroupContext = createContext<{
    value: Accessor<string>;
    onChange: (value: string) => void;
    disabled: Accessor<boolean | undefined>;
}>();

export const useRadioGroupContext = () => {
    const context = useContext(RadioGroupContext);

    if (!context) {
        throw new Error(
            'useContext must be used within the correct context provider',
        );
    }

    return context;
};
