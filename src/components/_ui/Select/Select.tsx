import clsx from 'clsx';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    type JSX,
    Match,
    mergeProps,
    onCleanup,
    Show,
    Switch,
    type VoidComponent,
} from 'solid-js';

import {
    Button,
    CountLabel,
    IconArrowCaretDownMd,
    IconEditAddPlus,
    IconInterfaceCheck,
    IconInterfaceCheckboxCheck,
    IconInterfaceCheckboxUnchecked,
    IconMenuCloseMd,
    Input,
    Popover,
    Separator,
} from '@/components';

type Option = {
    /**
     * Icon displayed to the left of the option
     */
    icon?: JSX.Element;
    /**
     * Label displayed in place of the value
     */
    label?: string;
    /**
     * The value of the option passed to `onChange` used as a label as a fallback
     */
    value: string;
    /**
     * Whether the option is disabled
     */
    disabled?: boolean;
} & {};

type Props = {
    /**
     * Placeholder text for select menu button
     */
    placeholder?: string;
    /**
     * List of option objects
     */
    options: Option[];
    /**
     * Selected option(s)
     */
    selected: string | string[];
    /**
     * Whether to show search bar
     * @default false
     */
    searchable?: boolean;
    /**
     * Placeholder text when options array is empty
     */
    emptyPlaceholder?: string;
    /**
     * Callback function when an option clicked
     */
    onChange: (value: string) => void;
    /**
     * Callback function to select all options
     */
    onSelectAll?: () => void;
    /**
     * Callback function to deselect all options
     */
    onDeselectAll?: () => void;
    /**
     * Callback function to clear selected options
     */
    onClearSelection?: () => void;
    /**
     * Callback function to add a new option
     */
    onAddNewOption?: (value: string) => void;
    /**
     * Whether the select menu button is disabled
     */
    disabled?: boolean;
    /**
     * Whether to close the select menu when an option is selected
     * @default true if `selected` is not an array
     */
    closeOnSelect?: boolean;
    /**
     * Whether to pin selected options
     */
    pinSelected?: boolean;
};

export const Select: VoidComponent<Props> = (rawProps) => {
    const props = mergeProps(
        { closeOnSelect: !Array.isArray(rawProps.selected), searchable: false },
        rawProps,
    );

    let searchInputRef!: HTMLInputElement;
    let popoverTriggerRef!: HTMLButtonElement;
    let popoverContentRef!: HTMLDivElement;

    const [isOpen, setIsOpen] = createSignal(false);
    const [searchQuery, setSearchQuery] = createSignal('');

    const isMultiSelect = () => Array.isArray(props.selected);

    const selectedSet = createMemo(() => {
        return isMultiSelect()
            ? new Set(props.selected)
            : new Set([props.selected]);
    });

    const isSelected = (value: string) => {
        return selectedSet().has(value);
    };

    const isAutoClose = () => !isMultiSelect() && props.closeOnSelect;

    const closeMenu = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                setIsOpen(false);
            },
        });

        tl.to(popoverContentRef, {
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.2,
            ease: 'circ.out',
        });
    };

    const filteredTags = createMemo(() => {
        return props.options.filter((option) => {
            const text = (option.label ?? option.value).toLowerCase();

            return text.includes(searchQuery().toLowerCase());
        });
    });

    const sortedTags = createMemo(() => {
        const list = [...(filteredTags() || [])];

        return list.sort((a, b) => {
            if (props.pinSelected) {
                const aSelected = isSelected(a.value);
                const bSelected = isSelected(b.value);

                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
            }

            return 0;
        });
    });

    createEffect(() => {
        if (isOpen() && popoverContentRef) {
            const ctx = gsap.context(() => {
                gsap.timeline().from(popoverContentRef, {
                    y: 20,
                    autoAlpha: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'circ.out',
                    onStart: () => {
                        if (props.searchable && searchInputRef)
                            searchInputRef.focus();
                    },
                });
            });

            onCleanup(() => ctx.revert());
        }
    });

    createEffect(() => {
        if (!isOpen()) {
            setSearchQuery('');
        }
    });

    const handleOptionClick = (value: string) => {
        const state = Flip.getState('.select-menu__item', { simple: true });

        props.onChange(value);

        if (isAutoClose()) {
            closeMenu();
        } else {
            Flip.from(state, {
                duration: 0.2,
                ease: 'power2.inOut',
                scale: true,
                simple: true,
                onEnter: (el) =>
                    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1 }),
                onLeave: (el) => gsap.to(el, { autoAlpha: 1 }),
            });
        }
    };

    return (
        <>
            <Button
                aria-expanded={isOpen()}
                class={clsx(
                    'justify-between rounded-lg border-2 px-3 text-white capitalize',
                )}
                disabled={props.disabled}
                ref={popoverTriggerRef}
                role='combobox'
                type='button'
                variant='secondary'
            >
                <div class='flex gap-2'>
                    <Switch fallback={props.placeholder ?? 'Select an option'}>
                        <Match when={isMultiSelect()}>
                            <Show
                                fallback={
                                    <>
                                        <span>selected</span>
                                        <CountLabel>
                                            {props.selected.length}
                                        </CountLabel>
                                    </>
                                }
                                when={props.placeholder}
                            >
                                <span>{props.placeholder}</span>
                                <CountLabel>{props.selected.length}</CountLabel>
                            </Show>
                        </Match>
                        <Match when={!isMultiSelect() && props.selected}>
                            {props.selected}
                        </Match>
                    </Switch>
                </div>
                <IconArrowCaretDownMd size='1.5em' />
            </Button>
            <Popover
                onOpenChange={(open) => {
                    if (open) {
                        setIsOpen(open);
                        return;
                    }

                    closeMenu();
                }}
                open={isOpen()}
                targetPosition='fixed'
                targetPositionArea='bottom center'
                triggerElement={popoverTriggerRef}
            >
                <div
                    class='mt-4 flex max-h-80 min-w-80 flex-col overscroll-contain rounded-lg bg-neutral-800 p-2 text-inherit'
                    ref={popoverContentRef}
                >
                    <Show
                        when={
                            props.searchable ||
                            props.onSelectAll ||
                            props.onDeselectAll ||
                            props.onClearSelection
                        }
                    >
                        <div class='flex flex-col flex-nowrap items-stretch gap-1'>
                            <Show when={props.searchable}>
                                <Input
                                    class='grow'
                                    onInput={(value) => setSearchQuery(value)}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            sortedTags().length > 0
                                        ) {
                                            setSearchQuery('');

                                            handleOptionClick(
                                                sortedTags()[0].value,
                                            );

                                            if (isAutoClose()) {
                                                closeMenu();
                                            }
                                        } else if (e.key === 'Escape') {
                                            closeMenu();
                                        }
                                    }}
                                    parse={(raw) => String(raw)}
                                    placeholder='Search...'
                                    ref={searchInputRef}
                                    type='search'
                                    value={searchQuery()}
                                />
                                <Show when={searchQuery().trim().length > 0}>
                                    <Button
                                        onClick={() => {
                                            props.onAddNewOption?.(
                                                searchQuery().trim(),
                                            );
                                            setSearchQuery('');
                                        }}
                                        variant='ghost'
                                    >
                                        <IconEditAddPlus />
                                        Add new option
                                    </Button>
                                </Show>
                            </Show>
                            <Show when={isMultiSelect()}>
                                <Show when={props.onSelectAll}>
                                    <Button
                                        onClick={props.onSelectAll}
                                        variant='ghost'
                                    >
                                        <IconInterfaceCheckboxCheck />
                                        Select All
                                    </Button>
                                </Show>
                                <Show when={props.onDeselectAll}>
                                    <Button
                                        onClick={props.onDeselectAll}
                                        variant='ghost'
                                    >
                                        <IconInterfaceCheckboxUnchecked />
                                        Deselect All
                                    </Button>
                                </Show>
                            </Show>
                            <Show
                                when={
                                    !isMultiSelect() &&
                                    props.selected &&
                                    props.onClearSelection
                                }
                            >
                                <Button
                                    onClick={props.onClearSelection}
                                    variant='ghost'
                                >
                                    <IconMenuCloseMd />
                                    Clear Selection
                                </Button>
                            </Show>
                        </div>
                        <Separator class='my-2 border-neutral-700' />
                    </Show>
                    <div class='flex flex-col flex-nowrap gap-1 overflow-y-auto'>
                        <Switch>
                            <Match
                                when={
                                    sortedTags().length === 0 &&
                                    searchQuery().length > 0
                                }
                            >
                                <span class='ml-4 text-sm'>
                                    No results found for "{searchQuery()}"
                                </span>
                            </Match>
                            <Match when={sortedTags().length === 0}>
                                {props.emptyPlaceholder ?? 'No options'}
                            </Match>
                            <Match when={sortedTags().length > 0}>
                                <For each={sortedTags()}>
                                    {(option) => (
                                        <Button
                                            class={clsx(
                                                'select-menu__item justify-between text-nowrap rounded-lg',
                                                isSelected(option.value) &&
                                                    'bg-blue-600/40 hover:bg-blue-700/40 active:bg-blue-800/40',
                                            )}
                                            data-flip-id={option.value}
                                            disabled={option.disabled}
                                            onClick={() =>
                                                handleOptionClick(option.value)
                                            }
                                            type='button'
                                            variant='ghost'
                                        >
                                            <div class='flex-row'>
                                                {option.icon ?? null}
                                                {option.label ?? option.value}
                                            </div>
                                            <IconInterfaceCheck
                                                style={{
                                                    visibility: isSelected(
                                                        option.value,
                                                    )
                                                        ? 'visible'
                                                        : 'hidden',
                                                }}
                                            />
                                        </Button>
                                    )}
                                </For>
                            </Match>
                        </Switch>
                    </div>
                </div>
            </Popover>
        </>
    );
};
