import { For, Match, Switch, type VoidComponent } from 'solid-js';

import { Button, Input } from '@/components';
import { useGlobalData } from '@/store';

import { AudioCard } from './AudioCard';
import { ImageCard } from './ImageCard';
import { SnippetCard } from './SnippetCard';
import { VideoCard } from './VideoCard';

type Props = {
    ref?: HTMLElement | ((el: HTMLElement) => void);
};

export const Main: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const imagesTabActive = () => globalData.store.activeTab === 'Images';
    const videosTabActive = () => globalData.store.activeTab === 'Videos';
    const audioTabActive = () => globalData.store.activeTab === 'Audio';
    const snippetsTabActive = () => globalData.store.activeTab === 'Snippets';

    return (
        <main class='flex flex-col gap-4' ref={props.ref}>
            <div class='flex justify-between'>
                <Input placeholder='Search...' type='search' />

                <div class='flex gap-2'>
                    <Button variant='secondary'>Filter</Button>
                    <Button variant='secondary'>Sort by</Button>
                    <Button variant='secondary'>Sort direction</Button>
                </div>
            </div>
            <div class='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4'>
                <Switch>
                    <Match when={imagesTabActive()}>
                        <For each={globalData.resources.images.get() || []}>
                            {(item) => <ImageCard image={item} />}
                        </For>
                    </Match>
                    <Match when={videosTabActive()}>
                        <For each={globalData.resources.videos.get() || []}>
                            {(item) => <VideoCard video={item} />}
                        </For>
                    </Match>
                    <Match when={audioTabActive()}>
                        <For each={globalData.resources.audio.get() || []}>
                            {(item) => <AudioCard audio={item} />}
                        </For>
                    </Match>
                    <Match when={snippetsTabActive()}>
                        <For each={globalData.resources.snippets.get() || []}>
                            {(item) => <SnippetCard snippet={item} />}
                        </For>
                    </Match>
                </Switch>
            </div>
        </main>
    );
};
