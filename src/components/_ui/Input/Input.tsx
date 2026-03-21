import {
    createMemo,
    createSignal,
    createUniqueId,
    type JSX,
    Match,
    Show,
    Switch,
    splitProps,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface Props<T = string>
    extends Omit<
        JSX.InputHTMLAttributes<HTMLInputElement>,
        'value' | 'onInput'
    > {
    label?: string;
    value?: T;
    required?: boolean;
    helperText?: string;
    error?: string;
    onInput?: (
        value: T,
        e: InputEvent & {
            currentTarget: HTMLInputElement;
        },
    ) => void;
    parse: (raw: string) => T;
    format?: (value: T) => string;
    validate?: (value: T) => string | undefined;
    children?: JSX.Element;
}

export const Input = <T = string>(props: Props<T>) => {
    const [local, others] = splitProps(props, [
        'class',
        'label',
        'value',
        'required',
        'helperText',
        'error',
        'onInput',
        'parse',
        'format',
        'validate',
    ]);

    const id = createUniqueId();

    const parse = local.parse ?? ((v: string) => v as unknown as T);
    const format = local.format ?? ((v: T) => String(v));

    const [value, setValue] = createSignal<T>(local.value ?? parse(''));

    const error = createMemo(() => local.error ?? local.validate?.(value()));

    const handleInput = (
        e: InputEvent & {
            currentTarget: HTMLInputElement;
        },
    ) => {
        const raw = e.currentTarget.value;
        const parsed = parse(raw);

        setValue(() => parsed);

        local.onInput?.(
            parsed,
            e as InputEvent & {
                currentTarget: HTMLInputElement;
            },
        );
    };

    return (
        <div class='flex w-full flex-col gap-2'>
            <Show when={local.label}>
                <label
                    class='font-bold text-neutral-200 text-sm capitalize'
                    for={id}
                >
                    {local.label}
                    {local.required && (
                        <span class='text-red-500' title='required'>
                            *
                        </span>
                    )}
                </label>
            </Show>
            <div class='flex flex-row items-center gap-2'>
                <input
                    aria-describedby={error() ? `${id}-error` : `${id}-helper`}
                    aria-invalid={!!error()}
                    class={twMerge(
                        'grow rounded-lg border border-neutral-600 bg-neutral-700/30 px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        error() && 'bg-red-500/30 focus:ring-red-500',
                        local.class,
                    )}
                    id={id}
                    onChange={(e) =>
                        handleInput(
                            e as unknown as InputEvent & {
                                currentTarget: HTMLInputElement;
                            },
                        )
                    }
                    onInput={handleInput}
                    required={local.required}
                    value={format(value())}
                    {...others}
                />
                {props.children}
            </div>
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
