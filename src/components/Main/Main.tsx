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
import { Button, Input, Select } from '@/components';
import {
    DISCORD_FREE_FILE_UPLOAD_LIMIT,
    DISCORD_FREE_MAX_CHAR_LIMIT,
} from '@/consts';
import { useGlobalData } from '@/store';

import { AudioCard } from './AudioCard';
import { ImageCard } from './ImageCard';
import { SnippetCard } from './SnippetCard';
import { VideoCard } from './VideoCard';

type Props = {
    ref?: HTMLElement | ((el: HTMLElement) => void);
};

const filtersList = ['Favorites', 'Discord Free limit', 'Deleted'] as const;

type FilterType = (typeof filtersList)[number];

export const Main: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const [searchQuery, setSearchQuery] = createSignal('');

    const [filter, setFilter] = createSignal<FilterType[]>([]);

    const imagesTabActive = () => globalData.store.activeTab === 'Images';
    const videosTabActive = () => globalData.store.activeTab === 'Videos';
    const audioTabActive = () => globalData.store.activeTab === 'Audio';
    const snippetsTabActive = () => globalData.store.activeTab === 'Snippets';

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

    const sortedImages = createMemo(() => {
        const list = [...(globalData.resources.images.get() || [])];

        const filtered = list.filter(filterList);

        return filtered;
    });

    const sortedVideos = createMemo(() => {
        const list = [...(globalData.resources.videos.get() || [])];

        const filtered = list.filter(filterList);

        return filtered;
    });

    const sortedAudio = createMemo(() => {
        const list = [...(globalData.resources.audio.get() || [])];

        const filtered = list.filter(filterList);

        return filtered;
    });

    const sortedSnippets = createMemo(() => {
        const list = [...(globalData.resources.snippets.get() || [])];
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

        return filtered;
    });

    const itemsCount = () => {
        switch (globalData.store.activeTab) {
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
                <Input
                    onInput={(e) => setSearchQuery(e.target.value.trim())}
                    placeholder='Search...'
                    type='search'
                    value={searchQuery()}
                />

                <div class='flex gap-2'>
                    <Select
                        onChange={(v) => {
                            if (filter().includes(v as FilterType)) {
                                setFilter(filter().filter((i) => i !== v));
                                return;
                            }

                            setFilter([...filter(), v as FilterType]);
                        }}
                        options={filtersList.map((i) => ({ value: i }))}
                        placeholder='Filter'
                        selected={filter()}
                    />
                    <Button variant='secondary'>Sort by</Button>
                    <Button variant='secondary'>Sort direction</Button>
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
