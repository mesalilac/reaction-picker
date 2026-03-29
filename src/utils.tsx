import { getCurrentWindow } from '@tauri-apps/api/window';
import clsx, { type ClassValue } from 'clsx';
import { toast } from 'solid-sonner';
import { twMerge } from 'tailwind-merge';

import type { CommandError } from '@/bindings';

export const minimizeWindow = async () => {
    try {
        const window = getCurrentWindow();
        await window.minimize();
    } catch (e) {
        console.error(e);
        toast.error(e as string);
    }
};

export const unminimizeWindow = async () => {
    try {
        const window = getCurrentWindow();
        await window.unminimize();
    } catch (e) {
        console.error(e);
        toast.error(e as string);
    }
};

export const handleUnexpectedError = (e: unknown) => {
    toast.error('Unexpected error', {
        description: e as string,
    });
    console.error(e);
};

export const handleIpcError = (
    e: CommandError,
    id?: string | number | undefined,
) => {
    if (typeof e === 'object') {
        toast.error(e.kind, {
            description: e.message,
            id,
        });
        console.error(e);
    } else {
        toast.error('IPC error', {
            description: e,
            id,
        });
        console.error(e);
    }
};

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(...inputs));
