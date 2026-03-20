import {
    createMemo,
    createSignal,
    For,
    Match,
    Show,
    Switch,
    type VoidComponent,
} from 'solid-js';

import type { Audio, Image, Video } from '@/bindings';
import { Input, Select } from '@/components';
import {
    DISCORD_FREE_FILE_UPLOAD_LIMIT,
    DISCORD_FREE_MAX_CHAR_LIMIT,
} from '@/consts';
import { useGlobalContext } from '@/store';

import { AudioCard } from './AudioCard';
import { ImageCard } from './ImageCard';
import { SnippetCard } from './SnippetCard';
import { VideoCard } from './VideoCard';

type Props = {
    ref?: HTMLElement | ((el: HTMLElement) => void);
};

const FILTERS_LIST = ['Favorites', 'Discord Free limit', 'Deleted'] as const;
type FilterType = (typeof FILTERS_LIST)[number];

const SORT_BY_LIST = [
    'Last used at date',
    'Use counter',
    'Added at date',
    'Size',
] as const;
type SortByType = (typeof SORT_BY_LIST)[number];

const SORT_DIR_LIST = ['Asc', 'Desc'] as const;
type SortDirType = (typeof SORT_DIR_LIST)[number];

export const Main: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    const [searchQuery, setSearchQuery] = createSignal('');

    const [filter, setFilter] = createSignal<FilterType[]>([]);
    const [sortBy, setSortBy] = createSignal<SortByType>('Last used at date');
    const [sortDir, setSortDir] = createSignal<SortDirType>('Desc');

    const imagesTabActive = () => globalCtx.store.activeTab === 'Images';
    const videosTabActive = () => globalCtx.store.activeTab === 'Videos';
    const audioTabActive = () => globalCtx.store.activeTab === 'Audio';
    const snippetsTabActive = () => globalCtx.store.activeTab === 'Snippets';

    const filterList = (item: Image | Video | Audio) => {
        const query = searchQuery().toLowerCase();

        const title = item.title?.toLowerCase();
        const description = item.description?.toLowerCase();
        const fileName = item.fileName.toLowerCase();
        const deleted = item.deletedAt !== null;
        const isFavorite = item.isFavorite;
        const belowDiscordFreeLimit =
            item.fileSize <= DISCORD_FREE_FILE_UPLOAD_LIMIT;

        const matchesSearch =
            !query ||
            title?.includes(query) ||
            description?.includes(query) ||
            fileName.includes(query);

        if (!matchesSearch) return false;

        if (filter().includes('Favorites')) {
            return isFavorite && !deleted;
        } else if (filter().includes('Discord Free limit')) {
            return belowDiscordFreeLimit && !deleted;
        } else if (filter().includes('Deleted')) {
            return deleted;
        } else {
            return !deleted;
        }
    };

    const sortList = (a: Image | Video | Audio, b: Image | Video | Audio) => {
        let result = 0;

        switch (sortBy()) {
            case 'Last used at date':
                result = (a.lastUsedAt || 0) - (b.lastUsedAt || 0);
                break;
            case 'Use counter':
                result = a.useCounter - b.useCounter;
                break;
            case 'Added at date':
                result = (a.createdAt || 0) - (b.createdAt || 0);
                break;
            case 'Size':
                result = a.fileSize - b.fileSize;
                break;
        }

        return sortDir() === 'Asc' ? result : -result;
    };

    const sortedImages = createMemo(() => {
        const list = globalCtx.resources.images.get() ?? [];

        const filtered = list.filter(filterList);

        return filtered.sort(sortList);
    });

    const sortedVideos = createMemo(() => {
        const list = globalCtx.resources.videos.get() ?? [];

        const filtered = list.filter(filterList);

        return filtered.sort(sortList);
    });

    const sortedAudio = createMemo(() => {
        const list = globalCtx.resources.audio.get() ?? [];

        const filtered = list.filter(filterList);

        return filtered.sort(sortList);
    });

    const sortedSnippets = createMemo(() => {
        const list = globalCtx.resources.snippets.get() ?? [];
        const query = searchQuery().toLowerCase();

        const filtered = list.filter((item) => {
            const title = item.title?.toLowerCase();
            const description = item.description?.toLowerCase();
            const content = item.content.toLowerCase();
            const deleted = item.deletedAt !== null;
            const isFavorite = item.isFavorite;
            const belowDiscordFreeLimit =
                item.content.length <= DISCORD_FREE_MAX_CHAR_LIMIT;

            const matchesSearch =
                !query ||
                title?.includes(query) ||
                description?.includes(query) ||
                content.includes(query);

            if (!matchesSearch) return false;

            if (filter().includes('Favorites')) {
                return isFavorite && !deleted;
            } else if (filter().includes('Discord Free limit')) {
                return belowDiscordFreeLimit && !deleted;
            } else if (filter().includes('Deleted')) {
                return deleted;
            } else {
                return !deleted;
            }
        });

        return filtered.sort((a, b) => {
            let result = 0;

            switch (sortBy()) {
                case 'Last used at date':
                    result = (a.lastUsedAt || 0) - (b.lastUsedAt || 0);
                    break;
                case 'Use counter':
                    result = a.useCounter - b.useCounter;
                    break;
                case 'Added at date':
                    result = (a.createdAt || 0) - (b.createdAt || 0);
                    break;
                case 'Size':
                    result = a.content.length - b.content.length;
                    break;
            }

            return sortDir() === 'Asc' ? result : -result;
        });
    });

    const itemsCount = () => {
        switch (globalCtx.store.activeTab) {
            case 'Images':
                return sortedImages().length;
            case 'Videos':
                return sortedVideos().length;
            case 'Audio':
                return sortedAudio().length;
            case 'Snippets':
                return sortedSnippets().length;
            default:
                return 0;
        }
    };

    return (
        <main class='flex flex-col gap-4' ref={props.ref}>
            <div class='flex justify-between'>
                <div>
                    <Input
                        onInput={(value) => setSearchQuery(value.trim())}
                        parse={(raw) => String(raw)}
                        placeholder='Search...'
                        type='search'
                        value={searchQuery()}
                    />
                </div>

                <div class='flex gap-2'>
                    <Select
                        onChange={(v) => {
                            if (filter().includes(v as FilterType)) {
                                setFilter(filter().filter((i) => i !== v));
                                return;
                            }

                            setFilter([...filter(), v as FilterType]);
                        }}
                        options={FILTERS_LIST.map((i) => ({ value: i }))}
                        placeholder='Filter'
                        selected={filter()}
                    />
                    <Select
                        onChange={(v) => {
                            setSortBy(v as SortByType);
                        }}
                        options={SORT_BY_LIST.map((i) => ({ value: i }))}
                        selected={sortBy()}
                    />
                    <Select
                        onChange={(v) => {
                            setSortDir(v as SortDirType);
                        }}
                        options={SORT_DIR_LIST.map((i) => ({ value: i }))}
                        selected={sortDir()}
                    />
                </div>
            </div>
            <Show when={searchQuery() || filter().length > 0}>
                <span>Found {itemsCount()} Results</span>
            </Show>
            <div class='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4'>
                <Switch>
                    <Match when={imagesTabActive()}>
                        <For each={sortedImages()}>
                            {(item) => <ImageCard image={item} />}
                        </For>
                    </Match>
                    <Match when={videosTabActive()}>
                        <For each={sortedVideos()}>
                            {(item) => <VideoCard video={item} />}
                        </For>
                    </Match>
                    <Match when={audioTabActive()}>
                        <For each={sortedAudio()}>
                            {(item) => <AudioCard audio={item} />}
                        </For>
                    </Match>
                    <Match when={snippetsTabActive()}>
                        <For each={sortedSnippets()}>
                            {(item) => <SnippetCard snippet={item} />}
                        </For>
                    </Match>
                </Switch>
            </div>
        </main>
    );
};
