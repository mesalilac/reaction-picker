import { createSignal, For, type VoidComponent } from 'solid-js';

import { Input, Separator } from '@/components';
import { useGlobalContext } from '@/store';

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

    return (
        <div class='flex max-h-80 min-h-80 flex-col gap-2 overflow-y-auto rounded-lg bg-neutral-800/50 p-2'>
            <Input
                onInput={(v) => setSearchQuery(v.trim())}
                parse={(raw) => String(raw)}
                placeholder='Search'
                type='search'
                value={searchQuery()}
            />
            <Separator class='mb-2 border-neutral-600' />
            <div class='grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2'>
                <For each={filteredTags()}>
                    {(tag) => <TagView tag={tag} />}
                </For>
            </div>
        </div>
    );
};
