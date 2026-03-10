import { Toaster } from 'solid-sonner';
import { DragOverlay, Main } from '@/components';
import { GlobalDataProvider } from './store';

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
                visibleToasts={5}
            />
            <DragOverlay />
            <Main />
        </GlobalDataProvider>
    );
}

export default App;
