import { create } from 'zustand';
import { FileEntry } from '../types/file';
import * as fileService from '../services/fileService';
import { useNavigationStore } from './navigationStore';

interface FileStore {
  currentDirectory: string | null;
  files: FileEntry[];
  selectedFile: FileEntry | null;
  fileContent: string | null;
  isLoading: boolean;
  error: string | null;
  isFileDirty: boolean;
  lastSavedContent: string | null;

  setCurrentDirectory: (path: string) => void;
  loadDirectory: (path: string) => Promise<void>;
  selectFile: (file: FileEntry) => Promise<void>;
  initializeWithHome: () => Promise<void>;
  navigateToParent: () => Promise<void>;
  clearError: () => void;
  updateFileContent: (content: string) => void;
  saveFile: () => Promise<void>;
  setFileDirty: (dirty: boolean) => void;
  createNewFile: (name: string) => Promise<void>;
  createNewFolder: (name: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  currentDirectory: null,
  files: [],
  selectedFile: null,
  fileContent: null,
  isLoading: false,
  error: null,
  isFileDirty: false,
  lastSavedContent: null,

  setCurrentDirectory: (path: string) => {
    set({ currentDirectory: path });
  },

  loadDirectory: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const files = await fileService.readDirectory(path);
      set({
        currentDirectory: path,
        files,
        isLoading: false,
      });
      
      // Trigger indexing for this directory in background
      import('../services/searchService').then((searchService) => {
        searchService.indexDirectory(path)
          .then((count) => {
            console.log(`Indexed ${count} files in ${path}`);
          })
          .catch((error) => {
            console.error('Background indexing failed:', error);
          });
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load directory',
        isLoading: false,
      });
    }
  },

  selectFile: async (file: FileEntry) => {
    if (file.is_directory) {
      // Navigate into directory
      await get().loadDirectory(file.path);
      set({ selectedFile: null, fileContent: null, isFileDirty: false, lastSavedContent: null });
    } else {
      // Load file content
      set({ isLoading: true, error: null, selectedFile: file });
      try {
        const content = await fileService.readFile(file.path);
        set({
          fileContent: content,
          lastSavedContent: content,
          isFileDirty: false,
          isLoading: false,
        });
        
        // Add to navigation history
        useNavigationStore.getState().pushHistory(file.path);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to read file',
          isLoading: false,
          fileContent: null,
          lastSavedContent: null,
          isFileDirty: false,
        });
      }
    }
  },

  initializeWithHome: async () => {
    set({ isLoading: true, error: null });
    try {
      const homeDir = await fileService.getHomeDirectory();
      await get().loadDirectory(homeDir);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load home directory',
        isLoading: false,
      });
    }
  },

  navigateToParent: async () => {
    const currentDir = get().currentDirectory;
    if (!currentDir) return;

    // Get parent directory
    const parts = currentDir.split('/').filter(Boolean);
    if (parts.length === 0) return; // Already at root

    parts.pop();
    const parentDir = '/' + parts.join('/');
    await get().loadDirectory(parentDir);
    set({ selectedFile: null, fileContent: null });
  },

  clearError: () => {
    set({ error: null });
  },

  updateFileContent: (content: string) => {
    const { lastSavedContent } = get();
    const isDirty = content !== lastSavedContent;
    set({ fileContent: content, isFileDirty: isDirty });
  },

  saveFile: async () => {
    const { selectedFile, fileContent } = get();
    if (!selectedFile || selectedFile.is_directory) {
      set({ error: 'No file selected' });
      return;
    }

    if (fileContent === null) {
      set({ error: 'No content to save' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await fileService.writeFile(selectedFile.path, fileContent);
      set({
        lastSavedContent: fileContent,
        isFileDirty: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save file',
        isLoading: false,
      });
    }
  },

  setFileDirty: (dirty: boolean) => {
    set({ isFileDirty: dirty });
  },

  createNewFile: async (name: string) => {
    const { currentDirectory } = get();
    if (!currentDirectory) {
      set({ error: 'No directory selected' });
      return;
    }

    const filePath = `${currentDirectory}/${name}`;
    set({ isLoading: true, error: null });
    
    try {
      await fileService.createFile(filePath);
      // Reload directory to show new file
      await get().loadDirectory(currentDirectory);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create file',
        isLoading: false,
      });
    }
  },

  createNewFolder: async (name: string) => {
    const { currentDirectory } = get();
    if (!currentDirectory) {
      set({ error: 'No directory selected' });
      return;
    }

    const folderPath = `${currentDirectory}/${name}`;
    set({ isLoading: true, error: null });
    
    try {
      await fileService.createDirectory(folderPath);
      // Reload directory to show new folder
      await get().loadDirectory(currentDirectory);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create folder',
        isLoading: false,
      });
    }
  },
}));

