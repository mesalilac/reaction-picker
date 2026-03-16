import { Flip } from 'gsap/Flip';
import { Toaster } from 'solid-sonner';

import { DragOverlay, Main, Nav } from '@/components';

import { GlobalDataProvider } from './store';

gsap.registerPlugin(Flip);

function App() {
    return (
        <GlobalDataProvider>
            <Toaster
                containerAriaLabel='Notifications'
                expand
                position='bottom-center'
                richColors
                swipeDirections={['left', 'right']}
                theme='dark'
                visibleToasts={2}
            />
            <DragOverlay />
            <div class='flex flex-col gap-5'>
                <Nav />
                <Main />
            </div>
        </GlobalDataProvider>
    );
}

export default App;
