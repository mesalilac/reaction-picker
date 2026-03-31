import { createSignal, type JSX, Show } from 'solid-js';

import { IconArrowCaretDownMd, IconArrowCaretUpMd } from '@/icons';
import { Button } from '@/ui';

export type Props = {
    label: string;
    open?: boolean;
    children: JSX.Element;
};

export const OptionGroup = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(props.open ?? true);

    return (
        <>
            <Button onClick={() => setIsOpen((p) => !p)} variant='ghost'>
                <Show
                    fallback={<IconArrowCaretDownMd size='1.5em' />}
                    when={isOpen()}
                >
                    <IconArrowCaretUpMd size='1.5em' />
                </Show>
                <span class='font-bold text-neutral-400 text-sm uppercase'>
                    {props.label}
                </span>
            </Button>
            <Show when={isOpen()}>
                <div class='ml-4 flex flex-col gap-1 rounded-lg bg-neutral-700/20'>
                    {props.children}
                </div>
            </Show>
        </>
    );
};
