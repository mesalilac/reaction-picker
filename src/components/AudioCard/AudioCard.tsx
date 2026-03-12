import { convertFileSrc } from '@tauri-apps/api/core';
import { onMount, type VoidComponent } from 'solid-js';
import type { Audio } from '@/bindings';

type Props = {
    audio: Audio;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

export const AudioCard: VoidComponent<Props> = (props) => {
    let audioRef!: HTMLAudioElement;

    onMount(() => {
        if (audioRef) audioRef.volume = 0.1;
    });

    return (
        <div
            class='flex h-80 flex-col gap-4 rounded-lg bg-neutral-900 p-4'
            ref={props.ref}
        >
            <audio class='w-full' controls ref={audioRef}>
                <source
                    src={convertFileSrc(props.audio.filePath)}
                    type={props.audio.mimeType}
                />
                <track kind='captions' />
            </audio>
            <div class='flex flex-col'>
                <span class='truncate'>{props.audio.title}</span>
            </div>
        </div>
    );
};
