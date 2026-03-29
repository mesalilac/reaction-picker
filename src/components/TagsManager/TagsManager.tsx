import { createSignal, For, Show, type VoidComponent } from 'solid-js';

import { commands } from '@/bindings';
import { IconEditAddPlus } from '@/icons';
import { useGlobalContext } from '@/store';
import { Button, Input, Separator } from '@/ui';
import { handleIpcError, handleUnexpectedError } from '@/utils';

import { TagView } from './TagView';

export const TagsManager: VoidComponent = () => {
    const globalCtx = useGlobalContext();

    const [searchQuery, setSearchQuery] = createSignal('');

    const filteredTags = () => {
        const list = globalCtx.resources.tags.get() ?? [];

        return list.filter((tag) => {
            return tag.name.toLowerCase().includes(searchQuery().toLowerCase());
        });
    };

    const addNewTag = async () => {
        const name = searchQuery().trim();

        if (!name) return;

        const res = await commands
            .createTag({ name })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.tags.mutate((prev) => {
            if (!prev) return;

            return [...prev, res.data];
        });

        setSearchQuery('');
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key !== 'Enter') return;

        addNewTag();
    };

    return (
        <div class='flex max-h-80 min-h-80 flex-col gap-2 overflow-y-auto rounded-lg bg-neutral-800/50 p-2'>
            <div class='flex gap-2'>
                <Input
                    onInput={(v) => setSearchQuery(v.trim())}
                    onKeyPress={handleKeyPress}
                    parse={(raw) => String(raw)}
                    placeholder='Search'
                    type='search'
                    value={searchQuery()}
                />
                <Show when={searchQuery().trim().length > 0}>
                    <Button
                        onClick={addNewTag}
                        title='Add new tag'
                        variant='secondary'
                    >
                        <IconEditAddPlus class='size-5' />
                    </Button>
                </Show>
            </div>
            <Separator class='mb-2 border-neutral-600' />
            <div class='grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2'>
                <For each={filteredTags()}>
                    {(tag) => <TagView tag={tag} />}
                </For>
            </div>
        </div>
    );
};
