import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { Toaster } from 'solid-sonner';

import { DragOverlay, Main, Nav } from '@/components';

import { GlobalContextProvider } from './store';

gsap.registerPlugin(Flip);

function App() {
    return (
        <GlobalContextProvider>
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
        </GlobalContextProvider>
    );
}

export default App;
