import { createSignal, type VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Input, Modal, type ModalWrapperProps, Textarea } from '@/components';
// import { useGlobalContext } from '@/store';

export const NewSnippetModal: VoidComponent<ModalWrapperProps> = (props) => {
    // const globalCtx = useGlobalContext();

    let contentInputRef!: HTMLTextAreaElement;

    const [contentInputError, setContentInputError] = createSignal<string>();

    const [store, setStore] = createStore<{
        title?: string;
        description?: string;
        content?: string;
        externalLink?: string;
        tags: string[];
    }>({
        tags: [],
    });

    const onAction = () => {
        if (!store.content) {
            contentInputRef.scrollIntoView();
            contentInputRef.focus();

            setContentInputError('Content is required');
            return;
        }

        props.onOpenChange(false);
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title='new snippet' />
            <Modal.Body>
                <Input
                    label='title'
                    onInput={(value) => setStore('title', value)}
                    parse={(raw) => String(raw)}
                    value={store.title}
                />
                <Textarea
                    class='h-16'
                    label='description'
                    onInput={(value) => setStore('description', value.trim())}
                    parse={(raw) => String(raw)}
                    value={store.description}
                />
                <Textarea
                    error={contentInputError()}
                    label='content'
                    onInput={(value) => {
                        setStore('content', value.trim());

                        if (contentInputError())
                            setContentInputError(undefined);
                    }}
                    parse={(raw) => String(raw)}
                    ref={contentInputRef}
                    required
                    value={store.content}
                />
                <Input
                    label='externalLink'
                    onInput={(value) => setStore('externalLink', value.trim())}
                    parse={(raw) => String(raw)}
                    value={store.externalLink}
                />
            </Modal.Body>
            <Modal.Footer onAction={onAction} />
        </Modal>
    );
};
