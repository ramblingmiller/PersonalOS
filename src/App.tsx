import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);

  useEffect(() => {
    // Initialize the file system with the home directory on mount
    initializeWithHome();
  }, [initializeWithHome]);

  return <AppLayout />;
}

export default App;
