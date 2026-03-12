import { convertFileSrc } from '@tauri-apps/api/core';
import { createEffect, type VoidComponent } from 'solid-js';
import type { Video } from '@/bindings';

type Props = {
    video: Video;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const VideoCard: VoidComponent<Props> = (props) => {
    let videoRef!: HTMLVideoElement;

    createEffect(() => {
        if (videoRef) videoRef.volume = 0.1;
    });

    return (
        <div
            class='flex flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            ref={props.ref}
        >
            <div class='h-80 w-full self-center'>
                <video class='h-full w-full rounded-lg' controls ref={videoRef}>
                    <source
                        src={convertFileSrc(props.video.filePath)}
                        type={props.video.mimeType}
                    />
                    <track kind='captions' />
                </video>
            </div>
            <div class='flex flex-col'>
                <span>{props.video.title}</span>
            </div>
        </div>
    );
};
