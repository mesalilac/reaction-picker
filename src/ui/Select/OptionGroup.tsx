import type { JSX } from 'solid-js';

export type Props = {
    label: string;
    children: JSX.Element;
};

export const OptionGroup = (props: Props) => {
    return (
        <>
            <span class='ml-4 font-bold text-neutral-400 text-sm uppercase'>
                {props.label}
            </span>
            <div class='ml-4 flex flex-col gap-1 rounded-lg bg-neutral-700/20'>
                {props.children}
            </div>
        </>
    );
};
