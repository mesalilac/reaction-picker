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

    const imagesCount = createMemo(
        () => globalData.resources.images.get()?.length || 0,
    );

    const videosCount = createMemo(
        () => globalData.resources.videos.get()?.length || 0,
    );

    const audioCount = createMemo(
        () => globalData.resources.audio.get()?.length || 0,
    );

    const snippetsCount = createMemo(
        () => globalData.resources.snippets.get()?.length || 0,
    );

    return (
        <div class='flex justify-between'>
            <div class='flex gap-3' ref={props.ref}>
                <Tab count={imagesCount()} type='Images' />
                <Tab count={videosCount()} type='Videos' />
                <Tab count={audioCount()} type='Audio' />
                <Tab count={snippetsCount()} type='Snippets' />
            </div>
            <div class='flex gap-5'>
                <Show when={globalData.store.activeTab === 'Snippets'}>
                    <Button variant='primary'>
                        <IconAddPlus />
                        <span>New</span>
                    </Button>
                </Show>

                <ButtonIcon>
                    <IconSettings />
                </ButtonIcon>
            </div>
        </div>
    );
};
