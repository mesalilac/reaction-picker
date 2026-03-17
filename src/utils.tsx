import { getCurrentWindow } from '@tauri-apps/api/window';
import { toast } from 'solid-sonner';

export const minimizeWindow = async () => {
    try {
        const window = await getCurrentWindow();
        window.minimize();
    } catch (e) {
        console.error(e);
        toast.error(e as string);
    }
};

export const unminimizeWindow = async () => {
    try {
        const window = await getCurrentWindow();
        window.unminimize();
    } catch (e) {
        console.error(e);
        toast.error(e as string);
    }
};
