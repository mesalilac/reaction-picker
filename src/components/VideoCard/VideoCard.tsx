import type { VoidComponent } from 'solid-js';
import type { Video } from '@/bindings';

type Props = {
    video: Video;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const VideoCard: VoidComponent<Props> = (props) => {
    return <div ref={props.ref}>{props.video.title}</div>;
};
