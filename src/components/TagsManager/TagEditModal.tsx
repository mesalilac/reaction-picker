import type { VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';

import { commands, type Tag } from '@/bindings';
import { Input, Modal, type ModalWrapperProps } from '@/components';
import { useGlobalContext } from '@/store';
import { handleIpcError, handleUnexpectedError } from '@/utils';

export const TagEditModal: VoidComponent<ModalWrapperProps & { tag: Tag }> = (
    props,
) => {
    const globalCtx = useGlobalContext();

    const [store, setStore] = createStore<{ name: string }>({
        name: props.tag.name,
    });

    const onAction = async () => {
        setStore('name', (prev) => prev.trim());

        if (!store.name) return;

        const res = await commands
            .updateTag(props.tag.id, {
                name: store.name,
            })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        globalCtx.resources.tags.mutate((prev) => {
            if (!prev) return;

            return prev.map((item) =>
                item.id === props.tag.id ? res.data : item,
            );
        });

        globalCtx.resources.images.refetch();
        globalCtx.resources.videos.refetch();
        globalCtx.resources.audio.refetch();
        globalCtx.resources.snippets.refetch();
        globalCtx.resources.generalStats.refetch();

        props.onOpenChange(false);
    };

    return (
        <Modal
            class='size-2/4'
            onOpenChange={props.onOpenChange}
            open={props.open}
        >
            <Modal.Title title='Edit tag' />
            <Modal.Body>
                <Input
                    label='Name'
                    onInput={(value) => setStore('name', value)}
                    parse={(raw) => String(raw)}
                    required
                    validate={(value, isDirty) => {
                        if (value.length === 0 && isDirty)
                            return 'Name is required';
                    }}
                    value={store.name || ''}
                />
            </Modal.Body>
            <Modal.Footer onAction={onAction} />
        </Modal>
    );
};
