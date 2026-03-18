import {
    createMemo,
    createSignal,
    createUniqueId,
    type JSX,
    Match,
    Show,
    Switch,
    splitProps,
    type VoidComponent,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    value?: string;
    required?: boolean;
    helperText?: string;
    error?: string;
    validate?: (value: string) => string | undefined;
}

export const Input: VoidComponent<Props> = (props) => {
    const [local, others] = splitProps(props, [
        'class',
        'label',
        'value',
        'required',
        'helperText',
        'error',
        'validate',
    ]);

    const id = createUniqueId();

    const [value, setValue] = createSignal(local.value ?? '');

    const error = createMemo(() => local.error ?? local.validate?.(value()));

    return (
        <div class='flex flex-col gap-2'>
            <Show when={local.label}>
                <label
                    class='font-bold text-neutral-200 text-sm capitalize'
                    for={id}
                >
                    {local.label}
                    {local.required && <span class='text-red-500'>*</span>}
                </label>
            </Show>
            <input
                aria-describedby={error() ? `${id}-error` : `${id}-helper`}
                aria-invalid={!!error()}
                class={twMerge(
                    'rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
                    local.class,
                )}
                id={id}
                onInput={(e) => {
                    const v = e.currentTarget.value;
                    setValue(v);
                    (
                        others.onInput as JSX.EventHandler<
                            HTMLInputElement,
                            InputEvent
                        >
                    )?.(e);
                }}
                required={local.required}
                value={value()}
                {...others}
            />
            <Switch>
                <Match when={error()}>
                    <span class='text-red-500 text-sm capitalize'>
                        {error()}
                    </span>
                </Match>
                <Match when={local.helperText}>
                    <span class='text-neutral-300 text-sm capitalize'>
                        {local.helperText}
                    </span>
                </Match>
            </Switch>
        </div>
    );
};
