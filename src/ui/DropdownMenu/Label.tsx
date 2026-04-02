import type { JSX } from 'solid-js';

type Props = {
    children: JSX.Element;
};

export const Label = (props: Props) => {
    return <div>{props.children}</div>;
};
