import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize the file system with the home directory on mount
    initializeWithHome();

    // Initialize search index
    const initSearch = async () => {
      try {
        await searchService.initIndex();
        console.log('Search index initialized');
        
        // Index home directory in background
        const homeDir = await useFileStore.getState().currentDirectory;
        if (homeDir) {
          searchService.indexDirectory(homeDir).then((count) => {
            console.log(`Indexed ${count} files`);
          }).catch((error) => {
            console.error('Failed to index directory:', error);
          });
        }
      } catch (error) {
        console.error('Failed to initialize search index:', error);
      }
    };

    initSearch();
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
