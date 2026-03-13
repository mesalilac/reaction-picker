import {
    createContext,
    createResource,
    type JSX,
    type Resource,
    type ResourceActions,
    useContext,
} from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';

import {
    type Audio,
    commands,
    type GeneralStats,
    type Image,
    type Setting,
    type Snippet,
    type Tag,
    type Video,
} from '@/bindings';

export type ManagedResource<T> = {
    get: Resource<T>;
    refetch: ResourceActions<T | undefined, unknown>['refetch'];
    mutate: ResourceActions<T | undefined, unknown>['mutate'];
};

export type TabType = 'Images' | 'Videos' | 'Audio' | 'Snippets';

export type GlobalStore = {
    activeTab: TabType;
};

export type GlobalData = {
    store: GlobalStore;
    setStore: SetStoreFunction<GlobalStore>;

    resources: {
        images: ManagedResource<Image[]>;
        videos: ManagedResource<Video[]>;
        audio: ManagedResource<Audio[]>;
        snippets: ManagedResource<Snippet[]>;
        tags: ManagedResource<Tag[]>;
        settings: ManagedResource<Setting>;
        generalStats: ManagedResource<GeneralStats>;
    };
};

const createGlobalData = (): GlobalData => {
    const [store, setStore] = createStore<GlobalStore>({
        activeTab: 'Images',
    });

    const [images, imagesActions] = createResource(async () => {
        const res = await commands.getImages();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [videos, videosActions] = createResource(async () => {
        const res = await commands.getVideos();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [audio, audioActions] = createResource(async () => {
        const res = await commands.getAudio();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [snippets, snippetsActions] = createResource(async () => {
        const res = await commands.getSnippets();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [tags, tagsActions] = createResource(async () => {
        const res = await commands.getTags();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [settings, settingsActions] = createResource(async () => {
        const res = await commands.getSettings();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [generalStats, generalStatsActions] = createResource(async () => {
        const res = await commands.getGeneralStats();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    return {
        store,
        setStore,
        resources: {
            images: {
                get: images,
                refetch: imagesActions.refetch,
                mutate: imagesActions.mutate,
            },
            videos: {
                get: videos,
                refetch: videosActions.refetch,
                mutate: videosActions.mutate,
            },
            audio: {
                get: audio,
                refetch: audioActions.refetch,
                mutate: audioActions.mutate,
            },
            snippets: {
                get: snippets,
                refetch: snippetsActions.refetch,
                mutate: snippetsActions.mutate,
            },
            tags: {
                get: tags,
                refetch: tagsActions.refetch,
                mutate: tagsActions.mutate,
            },
            settings: {
                get: settings,
                refetch: settingsActions.refetch,
                mutate: settingsActions.mutate,
            },

            generalStats: {
                get: generalStats,
                refetch: generalStatsActions.refetch,
                mutate: generalStatsActions.mutate,
            },
        },
    };
};

const GlobalContext = createContext<GlobalData>();

export const useGlobalData = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error(
            'useGlobalData must be used within a GlobalDataProvider',
        );
    }

    return context;
};

export function GlobalDataProvider(props: { children: JSX.Element }) {
    const globalData = createGlobalData();

    return (
        <GlobalContext.Provider value={globalData}>
            {props.children}
        </GlobalContext.Provider>
    );
}
