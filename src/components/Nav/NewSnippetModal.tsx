import type { VoidComponent } from 'solid-js';

import { Separator, useModalContext } from '@/components';
import { useGlobalContext } from '@/store';

export const NewSnippetModal: VoidComponent = () => {
    const globalCtx = useGlobalContext();
    const { setIsOpen } = useModalContext();

    return (
        <>
            Settings
            <Separator />
        </>
    );
};
