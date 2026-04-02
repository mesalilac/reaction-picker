import type { JSX } from 'solid-js';

type Props = {
    children: JSX.Element;
};

export const Content = (props: Props) => {
    return <div>{props.children}</div>;
};
