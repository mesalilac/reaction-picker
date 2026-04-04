import type { JSX } from 'solid-js';

type Props = {
    text: JSX.Element;
};

export const Helper = (props: Props) => {
    return <span class='text-neutral-500/80 text-xs'>{props.text}</span>;
};
