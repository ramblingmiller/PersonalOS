import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    let isMounted = true;
    
    // Proper async initialization
    (async () => {
      try {
        // Initialize search database first
        const dbPath = await searchService.initIndex();
        if (!isMounted) return;
        console.log('Search database ready at:', dbPath);
        
        // Initialize file system and wait for completion
        await initializeWithHome();
        if (!isMounted) return;
        
        // File system is now ready, get current directory
        const currentDir = useFileStore.getState().currentDirectory;
        if (!currentDir) {
          console.warn('No current directory set after initialization');
          return;
        }
        
        // Start indexing in background (non-blocking)
        console.log('Starting automatic background indexing...');
        searchService.indexDirectory(currentDir)
          .then((count) => {
            if (!isMounted) return;
            console.log(`✅ Indexed ${count} markdown files automatically`);
          })
          .catch((error) => {
            console.error('Background indexing failed:', error);
          });
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    })();
    
    // Cleanup function to prevent race conditions
    return () => {
      isMounted = false;
    };
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
