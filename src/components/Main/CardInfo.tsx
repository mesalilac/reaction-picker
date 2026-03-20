import { filesize } from 'filesize';
import { Match, type ParentComponent, Show, Switch } from 'solid-js';

import type { Audio, Image, Snippet, Video } from '@/bindings';

type FieldProps = {
    label: string;
    show?: boolean;
};

export const CardField: ParentComponent<FieldProps> = (props) => {
    return (
        <Show when={props.show !== false}>
            <div class='flex gap-2'>
                <span class='shrink-0 font-bold capitalize'>
                    {props.label}:
                </span>
                <span class='truncate text-neutral-400'>
                    {props.children ?? '-'}
                </span>
            </div>
        </Show>
    );
};

type Props =
    | {
          type: 'image';
          item: Image;
      }
    | {
          type: 'video';
          item: Video;
      }
    | {
          type: 'audio';
          item: Audio;
      }
    | {
          type: 'snippet';
          item: Snippet;
      };

export const CardInfo = (props: Props) => {
    return (
        <div class='flex flex-col gap-2'>
            <CardField label='title'>
                <span title={props.item.title ?? undefined}>
                    {props.item.title}
                </span>
            </CardField>
            <CardField label='description'>
                <span title={props.item.description ?? undefined}>
                    {props.item.description}
                </span>
            </CardField>
            <Show when={props.type === 'image' && props.item}>
                {(item) => {
                    const dimensions = () => `${item().width}x${item().height}`;

                    return (
                        <CardField label='dimensions'>
                            <span title={dimensions()}>{dimensions()}</span>
                        </CardField>
                    );
                }}
            </Show>
            <CardField label='total uses'>
                <span
                    title={
                        props.item.lastUsedAt
                            ? new Date(props.item.lastUsedAt).toLocaleString()
                            : undefined
                    }
                >
                    {props.item.useCounter}
                </span>
            </CardField>
            <Switch>
                <Match when={props.type !== 'snippet' && props.item}>
                    {(item) => (
                        <CardField label='file size'>
                            <span title={item().fileSize.toString()}>
                                {filesize(item().fileSize)}
                            </span>
                        </CardField>
                    )}
                </Match>
                <Match when={props.type === 'snippet' && props.item}>
                    {(item) => (
                        <>
                            <CardField label='length'>
                                <span>
                                    {item().content.length} character(s)
                                </span>
                            </CardField>
                            <CardField label='size'>
                                <span>
                                    {filesize(
                                        new TextEncoder().encode(item().content)
                                            .length,
                                    )}
                                </span>
                            </CardField>
                        </>
                    )}
                </Match>
            </Switch>
            <CardField label='tags'>
                <span>{props.item.tags.map((tag) => tag.name).join(', ')}</span>
            </CardField>
            <CardField label='deleted at' show={props.item.deletedAt !== null}>
                {props.item.deletedAt ? (
                    <span class='text-red-500'>
                        {new Date(props.item.deletedAt).toLocaleString()}
                    </span>
                ) : undefined}
            </CardField>
            <CardField label='added at'>
                {new Date(props.item.createdAt).toLocaleString()}
            </CardField>
        </div>
    );
};
