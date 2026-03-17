import { getCurrentWindow } from '@tauri-apps/api/window';
import { toast } from 'solid-sonner';

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
