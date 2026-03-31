import { Show } from 'solid-js';

import { IconEditAddPlus } from '@/icons';
import { Button, Input } from '@/ui';

export type Props = {
    query: string;
    setQuery: (query: string) => void;
    onCreateNewOption?: (value: string) => void;
    canCreateFromQuery?: (value: string) => boolean;
    class?: string;
};

export const Searchbar = (props: Props) => {
    const canCreateFromQuery = props.canCreateFromQuery ?? (() => true);

    const onCreate = () => {
        const query = props.query.trim();

        if (!query) return;

        props.setQuery('');
        props.onCreateNewOption?.(query);
    };

    return (
        <Input
            class={props.class}
            onInput={(value, _) => props.setQuery(value)}
            parse={(raw) => String(raw)}
            placeholder='Search'
            type='search'
            value={props.query}
        >
            <Show when={props.query.trim()}>
                <Button
                    disabled={!canCreateFromQuery(props.query)}
                    onClick={onCreate}
                    variant='primary'
                >
                    <IconEditAddPlus />
                </Button>
            </Show>
        </Input>
    );
};
