import {
    type Accessor,
    createSignal,
    type Setter,
    type VoidComponent,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import { Checkbox, Input, Modal, Separator } from '@/components';
import { useGlobalContext } from '@/store';

type Props = {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

export const SettingsModal: VoidComponent<Props> = (props) => {
    const globalCtx = useGlobalContext();

    const [minimizeOnCopy, setMinimizeOnCopy] = createSignal<boolean>(
        globalCtx.resources.settings.get()?.minimizeOnCopy || false,
    );
    const [defaultVolume, setDefaultVolume] = createSignal<number>(
        globalCtx.resources.settings.get()?.defaultVolume || 0.1,
    );

    const [store, setStore] = createStore<{
        minimizeOnCopy?: boolean;
        defaultVolume?: number;
    }>();

    const saveSettings = async () => {
        if (
            store.minimizeOnCopy === undefined &&
            store.defaultVolume === undefined
        ) {
            props.setIsOpen(false);

            return;
        }

        if (
            store.defaultVolume &&
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

        props.setIsOpen(false);
    };

    return (
        <Modal
            isOpen={props.isOpen}
            onAction={saveSettings}
            setIsOpen={props.setIsOpen}
        >
            Settings
            <Separator />
            <div class='flex flex-col gap-4'>
                <Checkbox
                    checked={minimizeOnCopy()}
                    label='Minimize on copy'
                    onChange={() => {
                        const newState = !minimizeOnCopy();

                        setStore('minimizeOnCopy', newState);
                        setMinimizeOnCopy(newState);
                    }}
                />
                <div class='flex items-center gap-2'>
                    <span>Default volume</span>
                    <Input
                        max={1}
                        min={0}
                        onChange={(e) => {
                            const value = Number(e.target.value);

                            setStore('defaultVolume', value);
                            setDefaultVolume(value);
                        }}
                        step={0.1}
                        type='number'
                        value={defaultVolume()}
                    />
                </div>
            </div>
        </Modal>
    );
};
