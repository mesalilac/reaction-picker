import type { VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import { Checkbox, Input, Modal, type ModalWrapperProps } from '@/components';
import { useGlobalContext } from '@/store';

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
            toast.error('Default volume must be between 0 and 1');
            return;
        }

        const res = await commands
            .updateSettings({
                defaultVolume: store.defaultVolume,
                minimizeOnCopy: store.minimizeOnCopy,
            })
            .catch((e) => {
                toast.error(e);
            });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.title title='Settings' />
            <div class='flex flex-col gap-4'>
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
                                : (settings?.defaultVolume ?? undefined)
                        }
                    />
                </div>
            </div>
            <Modal.footer onAction={saveSettings} />
        </Modal>
    );
};
