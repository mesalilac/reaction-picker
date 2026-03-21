import { createStore } from 'solid-js/store';

import type { Audio, Image, Snippet, Video } from '@/bindings';
import { Modal, type ModalWrapperProps } from '@/components';

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
        title: null,
        description: null,
        content: null,
        useCounter: null,
        externalLink: null,
        tagIds: [],
    });

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title={props.title} />
            <Modal.Body>hi</Modal.Body>
            <Modal.Footer onAction={() => props.onSave(store)} />
        </Modal>
    );
};
