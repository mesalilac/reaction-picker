import { ask } from '@tauri-apps/plugin-dialog';
import { createMemo, type VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import {
    Button,
    Checkbox,
    CountLabel,
    IconWarningTriangleWarning,
    Input,
    Modal,
    type ModalWrapperProps,
    Separator,
} from '@/components';
import { FALLBACK_VOLUME } from '@/consts';
import { type TabType, useGlobalContext } from '@/store';
import { handleIpcError, handleUnexpectedError } from '@/utils';

export const SettingsModal: VoidComponent<ModalWrapperProps> = (props) => {
    const globalCtx = useGlobalContext();

    const settings = globalCtx.resources.settings.get();

    const [store, setStore] = createStore<{
        minimizeOnCopy?: boolean;
        defaultVolume?: number;
    }>();

    const saveSettings = async () => {
        if (
            store.minimizeOnCopy === undefined &&
            store.defaultVolume === undefined
        ) {
            props.onOpenChange(!props.open);

            return;
        }

        if (
            store.defaultVolume !== undefined &&
            (store.defaultVolume < 0 || store.defaultVolume > 1)
        ) {
            return;
        }

        const res = await commands
            .updateSettings({
                defaultVolume: store.defaultVolume,
                minimizeOnCopy: store.minimizeOnCopy,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success('Settings saved successfully');

        globalCtx.resources.settings.mutate((prev) => {
            if (!prev) return;

            return {
                ...res.data,
            };
        });

        props.onOpenChange?.(!props.open);
    };

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

    const allCount = createMemo(() => {
        return imagesCount() + videosCount() + audioCount() + snippetsCount();
    });

    const deleteData = async (target?: TabType) => {
        const confirm = await ask(
            'This action cannot be reverted. Are you sure?',
            {
                title: 'Data management',
                kind: 'warning',
            },
        );

        if (!confirm) return;

        if (target === 'Images') {
            const res = await commands
                .removeDeleteAllImages()
                .catch(handleUnexpectedError);

            if (!res) return;

            if (res.status === 'error') {
                handleIpcError(res.error);

                return;
            }

            toast.success('All images deleted successfully');
        } else if (target === 'Videos') {
            const res = await commands
                .removeDeleteAllVideos()
                .catch(handleUnexpectedError);

            if (!res) return;

            if (res.status === 'error') {
                handleIpcError(res.error);

                return;
            }

            toast.success('All videos deleted successfully');
        } else if (target === 'Audio') {
            const res = await commands
                .removeDeleteAllAudio()
                .catch(handleUnexpectedError);

            if (!res) return;

            if (res.status === 'error') {
                handleIpcError(res.error);

                return;
            }

            toast.success('All audio deleted successfully');
        } else if (target === 'Snippets') {
            const res = await commands
                .removeDeleteAllSnippets()
                .catch(handleUnexpectedError);

            if (!res) return;

            if (res.status === 'error') {
                handleIpcError(res.error);

                return;
            }

            toast.success('All snippets deleted successfully');
        } else {
            const res = await commands
                .removeDeleteAllData()
                .catch(handleUnexpectedError);

            if (!res) return;

            if (res.status === 'error') {
                handleIpcError(res.error);

                return;
            }

            toast.success('All data deleted successfully');
        }

        globalCtx.resources.images.refetch();
        globalCtx.resources.videos.refetch();
        globalCtx.resources.audio.refetch();
        globalCtx.resources.snippets.refetch();
        globalCtx.resources.tags.refetch();
        globalCtx.resources.generalStats.refetch();
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title='Settings' />
            <Modal.Body>
                <div class='flex items-center gap-2'>
                    <Checkbox
                        checked={
                            store.minimizeOnCopy !== undefined
                                ? store.minimizeOnCopy
                                : settings?.minimizeOnCopy || false
                        }
                        label='Minimize on copy'
                        onChange={(checked) => {
                            setStore('minimizeOnCopy', checked);
                        }}
                    />
                </div>
                <div class='flex items-center gap-2'>
                    <Input
                        label='Default volume'
                        max={1}
                        min={0}
                        onInput={(value) => {
                            setStore('defaultVolume', value);
                        }}
                        parse={(raw) => Number(raw)}
                        step={0.1}
                        type='number'
                        validate={(value) => {
                            if (value < 0 || value > 1) {
                                return 'Default volume must be between 0 and 1';
                            }
                        }}
                        value={
                            store.defaultVolume !== undefined
                                ? store.defaultVolume
                                : (settings?.defaultVolume ?? FALLBACK_VOLUME)
                        }
                    />
                </div>
                <div>
                    <div>
                        <span class='text-lg capitalize'>data management</span>
                        <Separator class='mb-2' />
                    </div>
                    <div class='flex flex-wrap gap-2'>
                        <Button onClick={() => deleteData()} variant='danger'>
                            <IconWarningTriangleWarning />
                            Delete all
                            <CountLabel>{allCount()}</CountLabel>
                        </Button>
                        <Button
                            onClick={() => deleteData('Images')}
                            variant='danger'
                        >
                            <IconWarningTriangleWarning />
                            Delete all images
                            <CountLabel>{imagesCount()}</CountLabel>
                        </Button>
                        <Button
                            onClick={() => deleteData('Videos')}
                            variant='danger'
                        >
                            <IconWarningTriangleWarning />
                            Delete all videos
                            <CountLabel>{videosCount()}</CountLabel>
                        </Button>
                        <Button
                            onClick={() => deleteData('Audio')}
                            variant='danger'
                        >
                            <IconWarningTriangleWarning />
                            Delete all audio
                            <CountLabel>{audioCount()}</CountLabel>
                        </Button>
                        <Button
                            onClick={() => deleteData('Snippets')}
                            variant='danger'
                        >
                            <IconWarningTriangleWarning />
                            Delete all snippets
                            <CountLabel>{snippetsCount()}</CountLabel>
                        </Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer onAction={saveSettings} />
        </Modal>
    );
};
