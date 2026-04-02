import { createSignal, type JSX } from 'solid-js';

import { Content } from './Content';
import { SubMenuContext } from './context';
import { Trigger } from './Trigger';

type Props = {
    children: JSX.Element;
};

export const Sub = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const [triggerRef, setTriggerRef] = createSignal<
        HTMLButtonElement | undefined
    >(undefined);

    return (
        <SubMenuContext.Provider
            value={{
                isOpen,
                setIsOpen,
                closeMenu: () => setIsOpen(false),
                triggerRef,
                setTriggerRef,
            }}
        >
            {props.children}
        </SubMenuContext.Provider>
    );
};

Sub.Trigger = Trigger;
Sub.Content = Content;
