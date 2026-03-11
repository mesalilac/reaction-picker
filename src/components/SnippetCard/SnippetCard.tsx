import type { VoidComponent } from 'solid-js';
import type { Snippet } from '@/bindings';

type Props = {
    snippet: Snippet;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const SnippetCard: VoidComponent<Props> = (props) => {
    return <div ref={props.ref}>{props.snippet.title}</div>;
};
