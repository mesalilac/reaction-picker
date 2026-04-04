import { type JSX, Show } from 'solid-js';

import { Button, ToggleSwitch } from '@/ui';
import { cn } from '@/utils';

import { Helper } from './Helper';

type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    helper?: JSX.Element;
    label?: JSX.Element;
    class?: string;
    children: JSX.Element;
};

export const ItemSwitch = (props: Props) => {
    return (
        <Button
            class={cn(
                'w-full select-none text-nowrap text-neutral-200 capitalize disabled:bg-transparent',
                props.class,
            )}
            disabled={props.disabled}
            onClick={() => props.onChange(!props.checked)}
            variant='ghost'
        >
            <div class='flex w-full flex-col items-start gap-1'>
                <div class='flex w-full justify-between'>
                    <div class='flex flex-row gap-1'>{props.children}</div>
                    <ToggleSwitch
                        checked={props.checked}
                        disabled={props.disabled}
                        label={props.label}
                        onChange={() => {}}
                    />
                </div>

                <Show when={props.helper}>
                    <Helper text={props.helper} />
                </Show>
            </div>
        </Button>
    );
};
