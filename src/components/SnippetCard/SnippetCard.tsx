import type { VoidComponent } from 'solid-js';
import type { Snippet } from '@/bindings';

type Props = {
    snippet: Snippet;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const SnippetCard: VoidComponent<Props> = (props) => {
    return (
        <div
            class='flex flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            ref={props.ref}
        >
            <div class='h-80 w-full self-center'>
                <textarea
                    class='h-full w-full resize-none rounded-lg text-neutral-400'
                    textContent={props.snippet.content}
                />
            </div>
            <div class='flex flex-col'>
                <span class='truncate'>{props.snippet.title}</span>
            </div>
        </div>
    );
};
