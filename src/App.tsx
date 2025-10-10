import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize file system (non-blocking)
    initializeWithHome();
    
    // Initialize search database
    searchService.initIndex()
      .then((dbPath) => {
        console.log('Search database ready at:', dbPath);
        
        // After UI is loaded (3 seconds), start indexing in background
        setTimeout(() => {
          const currentDir = useFileStore.getState().currentDirectory;
          if (currentDir) {
            console.log('Starting automatic background indexing...');
            searchService.indexDirectory(currentDir)
              .then((count) => {
                console.log(`✅ Indexed ${count} markdown files automatically`);
              })
              .catch((error) => {
                console.error('Background indexing failed:', error);
              });
          }
        }, 3000);
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
