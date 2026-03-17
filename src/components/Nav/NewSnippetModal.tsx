import type { VoidComponent } from 'solid-js';

import { Separator, useModalContext } from '@/components';
import { useGlobalData } from '@/store';

export const NewSnippetModal: VoidComponent = () => {
    const globalData = useGlobalData();
    const { setIsOpen } = useModalContext();

    return (
        <>
            Settings
            <Separator />
        </>
    );
};
