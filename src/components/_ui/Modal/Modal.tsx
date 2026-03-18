import gsap from 'gsap';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

import {
    Button,
    IconCloseMd,
    IconSave,
    ModalContext,
    Separator,
} from '@/components';

export type ModalWrapperProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const Modal = (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction?: () => void;
    dismiss?: JSX.Element;
    action?: JSX.Element;
    children: JSX.Element;
}) => {
    let modalOverlayRef: HTMLDivElement | undefined;
    let modalContentRef: HTMLDivElement | undefined;

    const [shouldRender, setShouldRender] = createSignal(false);

    const animateOut = () => {
        if (!modalOverlayRef || !modalContentRef) return;

        const tl = gsap.timeline({
            onComplete: () => {
                setShouldRender(false);
                props.onOpenChange(!props.open);
            },
        });

        tl.to(modalContentRef, {
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.2,
            ease: 'power2.in',
        }).to(modalOverlayRef, { autoAlpha: 0, duration: 0.2 }, '-=0.1');
    };

    const close = () => animateOut();

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            close();
        }
    };

    createEffect(() => {
        if (props.open) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                if (modalOverlayRef && modalContentRef) {
                    gsap.timeline()
                        .to(modalOverlayRef, {
                            autoAlpha: 1,
                            duration: 0.2,
                            ease: 'power2.out',
                        })
                        .from(
                            modalContentRef,
                            {
                                y: 20,
                                autoAlpha: 0,
                                duration: 0.2,
                                ease: 'back.out(1.7)',
                            },
                            '-=0.2',
                        );
                }
            });

            const originalOverflow = window.getComputedStyle(
                document.body,
            ).overflow;
            document.body.style.overflow = 'hidden';

            document.addEventListener('keydown', handleKeydown);

            onCleanup(() => {
                document.body.style.overflow = originalOverflow;
                document.removeEventListener('keydown', handleKeydown);
            });
        } else {
            if (shouldRender()) animateOut();
        }
    });

    return (
        <Portal>
            <Show when={shouldRender()}>
                <div
                    class='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
                    onClick={close}
                    ref={modalOverlayRef}
                    role='none'
                >
                    <div
                        class='relative flex h-9/12 w-9/12 flex-col gap-2 rounded-lg bg-neutral-900/80 p-4 shadow-lg backdrop-blur-sm'
                        onClick={(e) => e.stopPropagation()}
                        ref={modalContentRef}
                        role='none'
                    >
                        <ModalContext.Provider
                            value={{
                                open: props.open,
                                close,
                            }}
                        >
                            {props.children}
                            <Separator class='mt-auto' />
                            <div class='flex flex-row gap-2 self-end'>
                                <Button onClick={close} variant='secondary'>
                                    {props.dismiss || (
                                        <>
                                            <IconCloseMd /> Cancel
                                        </>
                                    )}
                                </Button>
                                <Show when={props.onAction}>
                                    <Button onClick={props.onAction}>
                                        {props.action || (
                                            <>
                                                <IconSave /> Save
                                            </>
                                        )}
                                    </Button>
                                </Show>
                            </div>
                        </ModalContext.Provider>
                    </div>
                </div>
            </Show>
        </Portal>
    );
};
