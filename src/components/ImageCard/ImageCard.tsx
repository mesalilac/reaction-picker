import type { VoidComponent } from 'solid-js';
import type { Image } from '@/bindings';

type Props = {
    image: Image;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const ImageCard: VoidComponent<Props> = (props) => {
    return <div ref={props.ref}>{props.image.title}</div>;
};
