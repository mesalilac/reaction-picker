import { For, Match, Switch, type VoidComponent } from 'solid-js';
import { AudioCard, ImageCard, SnippetCard, VideoCard } from '@/components';
import { useGlobalData } from '@/store';

type Props = {
    ref?: HTMLElement | ((el: HTMLElement) => void);
};

export const Main: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    return (
        <main
            class='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4'
            ref={props.ref}
        >
            <Switch>
                <Match when={globalData.store.activeTab === 'Media'}>
                    todo!
                </Match>
                <Match when={globalData.store.activeTab === 'Images'}>
                    <For each={globalData.resources.images.get() || []}>
                        {(item) => <ImageCard image={item} />}
                    </For>
                </Match>
                <Match when={globalData.store.activeTab === 'Videos'}>
                    <For each={globalData.resources.videos.get() || []}>
                        {(item) => <VideoCard video={item} />}
                    </For>
                </Match>
                <Match when={globalData.store.activeTab === 'Audio'}>
                    <For each={globalData.resources.audio.get() || []}>
                        {(item) => <AudioCard audio={item} />}
                    </For>
                </Match>
                <Match when={globalData.store.activeTab === 'Snippets'}>
                    <For each={globalData.resources.snippets.get() || []}>
                        {(item) => <SnippetCard snippet={item} />}
                    </For>
                </Match>
            </Switch>
        </main>
    );
};
