import { Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { Audio, Image, Snippet, Video } from '@/bindings';
import {
    Button,
    Input,
    Modal,
    type ModalWrapperProps,
    Textarea,
} from '@/components';

type EditAssetStoreType = {
    title: string | null;
    description: string | null;
    content: string;
    useCounter: number;
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
        content: props.item.type === 'snippet' ? props.item.data.content : '',
        useCounter: props.item.data.useCounter,
        externalLink: props.item.data.externalLink,
        tagIds: props.item.data.tags.map((tag) => tag.id),
    });

    const onAction = () => {
        if (store.title?.trim() === '') setStore('title', null);
        if (store.description?.trim() === '') setStore('description', null);
        if (store.externalLink?.trim() === '') setStore('externalLink', null);
        if (props.item.type === 'snippet' && store.content.trim() === '')
            return;

        if (
            store.externalLink &&
            store.externalLink.length > 0 &&
            !store.externalLink.startsWith('http')
        )
            return;

        setStore('content', store.content.trim());
        if (store.title !== null) setStore('title', store.title.trim());
        if (store.description !== null)
            setStore('description', store.description.trim());
        if (store.externalLink !== null)
            setStore('externalLink', store.externalLink.trim());

        props.onSave(store);
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title={props.title} />
            <Modal.Body>
                <Input
                    label='title'
                    onInput={(value) => setStore('title', value)}
                    parse={(raw) => String(raw)}
                    value={store.title ?? ''}
                />
                <Textarea
                    label='description'
                    onInput={(value) => setStore('description', value)}
                    parse={(raw) => String(raw)}
                    value={store.description ?? ''}
                />
                <Show when={props.item.type === 'snippet'}>
                    <Textarea
                        label='content'
                        onInput={(value) => setStore('content', value)}
                        parse={(raw) => String(raw)}
                        required
                        validate={(value) => {
                            if (value.length === 0)
                                return 'Content cannot be empty';
                        }}
                        value={store.content ?? ''}
                    />
                </Show>
                <Input
                    label='external link'
                    onInput={(value) => setStore('externalLink', value)}
                    parse={(raw) => String(raw)}
                    validate={(value) => {
                        if (value.length > 0 && !value.startsWith('http'))
                            return 'Invalid link. Must start with http:// or https://';
                    }}
                    value={store.externalLink ?? ''}
                />
                <Input
                    label='use counter'
                    onInput={(value) => setStore('useCounter', value)}
                    parse={(raw) => Number(raw)}
                    value={store.useCounter ?? 0}
                >
                    <Button
                        onClick={() => {
                            setStore('useCounter', 0);
                        }}
                        variant='secondary'
                    >
                        Reset
                    </Button>
                </Input>
            </Modal.Body>
            <Modal.Footer onAction={onAction} />
        </Modal>
    );
};
