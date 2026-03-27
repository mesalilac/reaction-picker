import { createMemo, createSignal, Show, type VoidComponent } from 'solid-js';

import {
    Button,
    IconButton,
    IconEditAddPlus,
    IconInterfaceSettings,
} from '@/components';
import { useGlobalContext } from '@/store';

import { CreateSnippetModal } from './CreateSnippetModal';
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
    const [showCreateSnippetModal, setShowCreateSnippetModal] =
        createSignal(false);

    return (
        <nav class='flex justify-between'>
            <div class='flex gap-3' ref={props.ref}>
                <Tab count={imagesCount()} type='Images' />
                <Tab count={videosCount()} type='Videos' />
                <Tab count={audioCount()} type='Audio' />
                <Tab count={snippetsCount()} type='Snippets' />
            </div>
            <div class='flex gap-5'>
                <Show when={globalCtx.store.activeTab === 'Snippets'}>
                    <Button onClick={() => setShowCreateSnippetModal(true)}>
                        <IconEditAddPlus />
                        <span>Create</span>
                    </Button>
                    <Show when={showCreateSnippetModal()}>
                        <CreateSnippetModal
                            onOpenChange={(open) => {
                                setShowCreateSnippetModal(open);
                            }}
                            open={showCreateSnippetModal()}
                        />
                    </Show>
                </Show>

                <IconButton
                    icon={<IconInterfaceSettings class='size-5' />}
                    onClick={() => setShowSettingsModal(true)}
                />
                <Show when={showSettingsModal()}>
                    <SettingsModal
                        onOpenChange={(open) => {
                            setShowSettingsModal(open);
                        }}
                        open={showSettingsModal()}
                    />
                </Show>
            </div>
        </nav>
    );
};
