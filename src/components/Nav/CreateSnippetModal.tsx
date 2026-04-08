import { Input, Modal, type ModalWrapperProps, Textarea } from 'cronus-ui/ui';
import { createSignal, type VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import { useGlobalContext } from '@/store';
import { handleIpcError, handleUnexpectedError } from '@/utils';

export const CreateSnippetModal: VoidComponent<ModalWrapperProps> = (props) => {
    const globalCtx = useGlobalContext();

    const [contentInputError, setContentInputError] = createSignal<string>();
    let contentInputRef!: HTMLTextAreaElement;

    const [store, setStore] = createStore<{
        title: string | null;
        description: string | null;
        content: string;
        externalLink: string | null;
        tagIds: string[];
    }>({
        title: null,
        description: null,
        content: '',
        externalLink: null,
        tagIds: [],
    });

    const onAction = async () => {
        if (!store.content) {
            contentInputRef.scrollIntoView();
            contentInputRef.focus();

            setContentInputError('Content cannot be empty');
            return;
        }

        if (
            store.externalLink &&
            store.externalLink.length > 0 &&
            !store.externalLink.startsWith('http')
        )
            return;

        props.onOpenChange(false);

        setStore('content', store.content.trim());
        if (store.title !== null) setStore('title', store.title.trim());
        if (store.description !== null)
            setStore('description', store.description.trim());
        if (store.externalLink !== null)
            setStore('externalLink', store.externalLink.trim());

        const res = await commands
            .createSnippet({ ...store })
            .catch(handleUnexpectedError);

        if (!res) return;

        if (res.status === 'error') {
            handleIpcError(res.error);

            return;
        }

        toast.success('Snippet created successfully');

        globalCtx.resources.snippets.mutate((prev) => {
            if (!prev) return;

            return [...prev, res.data];
        });
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.Title title='create snippet' />
            <Modal.Body>
                <Input
                    label='title'
                    onInput={(value) => setStore('title', value)}
                    parse={(raw) => String(raw)}
                    value={store.title ?? ''}
                />
                <Textarea
                    class='h-16'
                    label='description'
                    onInput={(value) => setStore('description', value)}
                    parse={(raw) => String(raw)}
                    value={store.description ?? ''}
                />
                <Textarea
                    error={contentInputError()}
                    label='content'
                    onInput={(value) => setStore('content', value)}
                    parse={(raw) => String(raw)}
                    ref={contentInputRef}
                    required
                    validate={(value, isDirty) => {
                        if (value.length === 0 && isDirty)
                            return 'Content cannot be empty';
                    }}
                    value={store.content}
                />
                <Input
                    label='externalLink'
                    onInput={(value) => setStore('externalLink', value)}
                    parse={(raw) => String(raw)}
                    validate={(value) => {
                        if (value.length > 0 && !value.startsWith('http'))
                            return 'Invalid link. Must start with http:// or https://';
                    }}
                    value={store.externalLink ?? ''}
                />
            </Modal.Body>
            <Modal.Footer action={'Create'} onAction={onAction} />
        </Modal>
    );
};
