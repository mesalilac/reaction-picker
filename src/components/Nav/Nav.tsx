import { createMemo, Show, type VoidComponent } from 'solid-js';
import {
    Button,
    ButtonIcon,
    IconAddPlus,
    IconSettings,
    Tab,
} from '@/components';
import { useGlobalData } from '@/store';

type Props = {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const Nav: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const mediaCount = createMemo(() => {
        const images = globalData.resources.images.get()?.length || 0;
        const videos = globalData.resources.videos.get()?.length || 0;
        const audio = globalData.resources.audio.get()?.length || 0;

        return images + videos + audio;
    });

    return (
        <div class='flex justify-between'>
            <div class='flex gap-3' ref={props.ref}>
                <Tab count={mediaCount()} type='Media' />
                <Tab
                    count={globalData.resources.images.get()?.length || 0}
                    type='Images'
                />
                <Tab
                    count={globalData.resources.videos.get()?.length || 0}
                    type='Videos'
                />
                <Tab
                    count={globalData.resources.audio.get()?.length || 0}
                    type='Audio'
                />
                <Tab
                    count={globalData.resources.snippets.get()?.length || 0}
                    type='Snippets'
                />
            </div>
            <div class='flex gap-5'>
                <Show when={globalData.store.activeTab === 'Snippets'}>
                    <Button variant='primary'>
                        <IconAddPlus class='size-5' />
                        <span>New</span>
                    </Button>
                </Show>

                <ButtonIcon>
                    <IconSettings class='size-5' />
                </ButtonIcon>
            </div>
        </div>
    );
};
