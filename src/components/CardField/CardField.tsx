import { type JSX, type ParentComponent, Show } from 'solid-js';

type Props = {
    label: string;
    show?: boolean;
    children: JSX.Element;
};

export const CardField: ParentComponent<Props> = (props) => {
    return (
        <Show when={props.show !== false}>
            <div class='flex gap-2'>
                <span class='shrink-0 font-bold capitalize'>
                    {props.label}:
                </span>
                <span class='truncate text-neutral-400'>
                    {props.children ?? '-'}
                </span>
            </div>
        </Show>
    );
};
