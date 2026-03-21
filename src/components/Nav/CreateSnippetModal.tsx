import { createSignal, type VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import { commands } from '@/bindings';
import { Input, Modal, type ModalWrapperProps, Textarea } from '@/components';
import { useGlobalContext } from '@/store';

export const CreateSnippetModal: VoidComponent<ModalWrapperProps> = (props) => {
    const globalCtx = useGlobalContext();

    let contentInputRef!: HTMLTextAreaElement;

    const [contentInputError, setContentInputError] = createSignal<string>();

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

            setContentInputError('Content is required');
            return;
        }

        if (
            store.externalLink &&
            store.externalLink.length > 0 &&
            !store.externalLink.startsWith('http')
        )
            return;

        props.onOpenChange(false);

        const res = await commands.createSnippet({ ...store }).catch((e) => {
            toast.error(e);
        });

        if (!res) return;

        if (res.status === 'error') {
            toast.error(res.error.kind, {
                description: res.error.message,
            });

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
                    onInput={(value) => setStore('description', value.trim())}
                    parse={(raw) => String(raw)}
                    value={store.description ?? ''}
                />
                <Textarea
                    error={contentInputError()}
                    label='content'
                    onInput={(value) => setStore('content', value.trim())}
                    parse={(raw) => String(raw)}
                    ref={contentInputRef}
                    required
                    value={store.content}
                />
                <Input
                    label='externalLink'
                    onInput={(value) => setStore('externalLink', value.trim())}
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
