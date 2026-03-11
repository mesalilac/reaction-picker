import type { VoidComponent } from 'solid-js';
import type { Audio } from '@/bindings';

type Props = {
    audio: Audio;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const AudioCard: VoidComponent<Props> = (props) => {
    return <div ref={props.ref}>{props.audio.title}</div>;
};
