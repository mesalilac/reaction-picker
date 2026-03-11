import { clsx } from 'clsx';
import { gsap } from 'gsap';
import {
    createEffect,
    createSignal,
    onCleanup,
    type VoidComponent,
} from 'solid-js';
import { type TabType, useGlobalData } from '@/store';

type Props = {
    type: TabType;
    count: number;
    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
};

export const Tab: VoidComponent<Props> = (props) => {
    const globalData = useGlobalData();

    const counter = {
        val: 0,
    };

    const [count, setCount] = createSignal(0);

    const isActive = () => globalData.store.activeTab === props.type;

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
            class={clsx(
                'cursor-pointer border-b-2 p-1 transition-colors duration-150 ease-out',
                isActive()
                    ? 'text-blue-500'
                    : 'border-transparent hover:text-blue-500/50',
            )}
            onClick={() => globalData.setStore('activeTab', props.type)}
            ref={props.ref}
            type='button'
        >
            {props.type} ({count()})
        </button>
    );
};
