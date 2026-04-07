import { gsap } from 'gsap';
import {
    createEffect,
    createSignal,
    onCleanup,
    type VoidComponent,
} from 'solid-js';

import { type TabType, useGlobalContext } from '@/store';
import { Badge } from '@/ui';
import { cn } from '@/utils';

export const Tab: VoidComponent<{
    type: TabType;
    count: number;
    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}> = (props) => {
    const globalCtx = useGlobalContext();

    const counter = {
        val: 0,
    };

    const [count, setCount] = createSignal(0);

    const isActive = () => globalCtx.store.activeTab === props.type;

    createEffect(() => {
        const total = props.count;

        const tween = gsap.to(counter, {
            val: total,
            duration: 0.3,
            onUpdate: () => {
                setCount(Math.floor(counter.val));
            },
        });

        onCleanup(() => tween.kill());
    });

    return (
        <button
            class={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors duration-150 ease-out',
                isActive() ? 'bg-blue-600' : 'hover:bg-neutral-600/30',
            )}
            onClick={() => {
                globalCtx.setStore('activeTab', props.type);
                window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            ref={props.ref}
            type='button'
        >
            {props.type}
            <Badge>{count()}</Badge>
        </button>
    );
};
