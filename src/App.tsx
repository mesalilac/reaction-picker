import { Toaster } from 'solid-toast';
import { DragOverlay } from '@/components';

function App() {
    return (
        <>
            <main>hi</main>

            <DragOverlay />
            <Toaster
                toastOptions={{
                    position: 'bottom-center',
                }}
            />
        </>
    );
}

export default App;
