import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize file system only
    initializeWithHome();
    
    // Initialize empty search database (no indexing yet)
    searchService.initIndex()
      .then((dbPath) => {
        console.log('Search database initialized at:', dbPath);
      })
      .catch((error) => {
        console.error('Failed to initialize search database:', error);
      });
  }, [initializeWithHome]);

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFileDirty) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFileDirty]);

  return <AppLayout />;
}

export default App;
