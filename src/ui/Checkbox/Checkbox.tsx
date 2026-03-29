import { clsx } from 'clsx';
import { Show, type VoidComponent } from 'solid-js';

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
};

export const Checkbox: VoidComponent<Props> = (props) => {
    return (
        <div
            class='flex items-center gap-2'
            onClick={() => props.onChange(!props.checked)}
            role='none'
        >
            <div
                class={clsx(
                    'flex size-4 cursor-pointer items-center rounded-sm border transition-colors duration-100',
                    props.checked
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-neutral-300',
                )}
            >
                <Show when={props.checked}>
                    <svg
                        class='size-4'
                        fill='none'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <title>Check</title>
                        <path d='M5 12l5 5l10 -10' />
                    </svg>
                </Show>
            </div>
            <span class='font-bold'>{props.label}</span>
        </div>
    );
};
