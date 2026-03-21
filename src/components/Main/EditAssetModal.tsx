import { createStore } from 'solid-js/store';

import type { Audio, Image, Snippet, Video } from '@/bindings';
import { Input, Modal, type ModalWrapperProps } from '@/components';

type EditAssetStoreType = {
    title: string | null;
    description: string | null;
    content: string | null;
    useCounter: number | null;
    externalLink: string | null;
    tagIds: string[];
};

export const EditAssetModal = (
    props: ModalWrapperProps & {
        title: string;
        onSave: (store: EditAssetStoreType) => void;
        item:
            | {
                  type: 'image';
                  data: Image;
              }
            | {
                  type: 'video';
                  data: Video;
              }
            | {
                  type: 'audio';
                  data: Audio;
              }
            | {
                  type: 'snippet';
                  data: Snippet;
              };
    },
) => {
    const [store, setStore] = createStore<EditAssetStoreType>({
        title: props.item.data.title,
        description: props.item.data.description,
        content: props.item.type === 'snippet' ? props.item.data.content : null,
        useCounter: props.item.data.useCounter,
        externalLink: props.item.data.externalLink,
        tagIds: [],
    });

    const onAction = () => {
        if (store.title === props.item.data.title || store.title?.trim() === '')
            setStore('title', null);
        if (
            store.description === props.item.data.description ||
            store.description?.trim() === ''
        )
            setStore('description', null);
        if (
            (props.item.type === 'snippet' &&
                store.content === props.item.data.content) ||
            store.content?.trim() === ''
        )
            setStore('content', null);
        if (store.useCounter === props.item.data.useCounter)
            setStore('useCounter', null);
        if (
            store.externalLink === props.item.data.externalLink ||
            store.externalLink?.trim() === ''
        )
            setStore('externalLink', null);

        props.onSave(store);
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title={props.title} />
            <Modal.Body>
                <Input
                    label='title'
                    onInput={(value) => setStore('title', value?.trim())}
                    parse={(raw) => String(raw)}
                    value={store.title ?? ''}
                />
            </Modal.Body>
            <Modal.Footer onAction={onAction} />
        </Modal>
    );
};
