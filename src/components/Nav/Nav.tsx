import { createMemo, createSignal, Show, type VoidComponent } from 'solid-js';

import { Button, ButtonIcon, IconAddPlus, IconSettings } from '@/components';
import { useGlobalContext } from '@/store';

import { SettingsModal } from './SettingsModal';
import { Tab } from './Tab';

type Props = {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const Nav: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    const imagesCount = createMemo(
        () => globalCtx.resources.images.get()?.length || 0,
    );

    const videosCount = createMemo(
        () => globalCtx.resources.videos.get()?.length || 0,
    );

    const audioCount = createMemo(
        () => globalCtx.resources.audio.get()?.length || 0,
    );

    const snippetsCount = createMemo(
        () => globalCtx.resources.snippets.get()?.length || 0,
    );

    const [showSettingsModal, setShowSettingsModal] = createSignal(false);

    return (
        <div class='flex justify-between'>
            <div class='flex gap-3' ref={props.ref}>
                <Tab count={imagesCount()} type='Images' />
                <Tab count={videosCount()} type='Videos' />
                <Tab count={audioCount()} type='Audio' />
                <Tab count={snippetsCount()} type='Snippets' />
            </div>
            <div class='flex gap-5'>
                <Show when={globalCtx.store.activeTab === 'Snippets'}>
                    <Button>
                        <IconAddPlus />
                        <span>New</span>
                    </Button>
                </Show>

                <ButtonIcon onClick={() => setShowSettingsModal(true)}>
                    <IconSettings />
                </ButtonIcon>
                <Show when={showSettingsModal()}>
                    <SettingsModal
                        isOpen={showSettingsModal}
                        setIsOpen={setShowSettingsModal}
                    />
                </Show>
            </div>
        </div>
    );
};
