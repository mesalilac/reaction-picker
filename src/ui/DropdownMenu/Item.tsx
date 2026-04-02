import type { JSX } from 'solid-js';

type Props = {
    children: JSX.Element;
};

export const Item = (props: Props) => {
    return <div>{props.children}</div>;
};
