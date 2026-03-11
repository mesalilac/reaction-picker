import { convertFileSrc } from '@tauri-apps/api/core';
import { decode } from 'blurhash';
import { createSignal, onMount, Show, type VoidComponent } from 'solid-js';
import type { Image } from '@/bindings';
import { Button, ButtonIcon, IconMoreVertical } from '@/components';

type Props = {
    image: Image;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const ImageCard: VoidComponent<Props> = (props) => {
    let canvasRef!: HTMLCanvasElement;

    const [loaded, setLoaded] = createSignal(false);

    onMount(() => {
        if (canvasRef) {
            const ratio = props.image.height / props.image.width;

            const width = 32;
            const height = Math.round(width * ratio);

            canvasRef.width = width;
            canvasRef.height = height;

            const image = decode(props.image.blurHash, width, height);
            const ctx = canvasRef.getContext('2d');
            if (!ctx) return;

            const imageData = ctx.createImageData(width, height);
            if (!imageData) return;

            imageData.data.set(image);
            ctx.putImageData(imageData, 0, 0);
        }
    });

    return (
        <div
            class='flex flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            ref={props.ref}
        >
            <div class='h-80 w-full self-center'>
                <Show when={!loaded()}>
                    <canvas class='h-full w-full' ref={canvasRef}></canvas>
                </Show>
                <img
                    aria-label={props.image.title || 'Image'}
                    class='h-full w-full object-contain'
                    onLoad={() => setLoaded(true)}
                    src={convertFileSrc(props.image.filePath)}
                    style={{
                        display: loaded() ? 'block' : 'none',
                    }}
                />
            </div>
            <div class='flex flex-row justify-between'>
                <div class='flex flex-row gap-2'>
                    <Button variant='primary'>Copy</Button>
                </div>
                <div class='flex flex-row gap-2'>
                    <ButtonIcon>
                        <IconMoreVertical />
                    </ButtonIcon>
                </div>
            </div>
        </div>
    );
};
