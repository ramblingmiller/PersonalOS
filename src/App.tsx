import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize the file system and search index
    const init = async () => {
      try {
        // First initialize index database
        const dbPath = await searchService.initIndex();
        console.log('Search index initialized at:', dbPath);
        
        // Then initialize file system
        await initializeWithHome();
        
        // Wait a bit for the state to update, then index
        setTimeout(async () => {
          const currentDir = useFileStore.getState().currentDirectory;
          console.log('Indexing directory:', currentDir);
          
          if (currentDir) {
            try {
              const count = await searchService.indexDirectory(currentDir);
              console.log(`Indexed ${count} markdown files`);
            } catch (error) {
              console.error('Failed to index directory:', error);
            }
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();
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
