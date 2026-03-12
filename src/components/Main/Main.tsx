import { For, Match, Switch, type VoidComponent } from 'solid-js';
import { AudioCard, ImageCard, SnippetCard, VideoCard } from '@/components';
import { useGlobalData } from '@/store';

type Props = {
    ref?: HTMLElement | ((el: HTMLElement) => void);
};

export const Main: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const mediaTabActive = () => globalData.store.activeTab === 'Media';
    const imagesTabActive = () => globalData.store.activeTab === 'Images';
    const videosTabActive = () => globalData.store.activeTab === 'Videos';
    const audioTabActive = () => globalData.store.activeTab === 'Audio';
    const snippetsTabActive = () => globalData.store.activeTab === 'Snippets';

    return (
        <main
            class='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4'
            ref={props.ref}
        >
            <Switch>
                <Match when={mediaTabActive()}>todo!</Match>
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
        </main>
    );
};
