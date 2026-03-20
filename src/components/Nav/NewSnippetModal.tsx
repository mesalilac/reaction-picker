import type { VoidComponent } from 'solid-js';

import { Modal, type ModalWrapperProps } from '@/components';
import { useGlobalContext } from '@/store';

export const NewSnippetModal: VoidComponent<ModalWrapperProps> = (props) => {
    const globalCtx = useGlobalContext();

    const onAction = () => {
        props.onOpenChange(false);
    };

    return (
        <Modal onOpenChange={props.onOpenChange} open={props.open}>
            <Modal.title title='new snippet' />
            <Modal.footer onAction={onAction} />
        </Modal>
    );
};
