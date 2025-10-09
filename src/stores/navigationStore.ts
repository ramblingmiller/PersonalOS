import { create } from 'zustand';

interface NavigationStore {
  history: string[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;

  pushHistory: (path: string) => void;
  goBack: () => string | null;
  goForward: () => string | null;
  clear: () => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  history: [],
  currentIndex: -1,
  canGoBack: false,
  canGoForward: false,

  pushHistory: (path: string) => {
    const { history, currentIndex } = get();

    // Don't add if it's the same as current
    if (history[currentIndex] === path) {
      return;
    }

    // Remove forward history when navigating to new location
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(path);

    const newIndex = newHistory.length - 1;

    set({
      history: newHistory,
      currentIndex: newIndex,
      canGoBack: newIndex > 0,
      canGoForward: false,
    });
  },

  goBack: () => {
    const { history, currentIndex } = get();

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      set({
        currentIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: true,
      });
      return history[newIndex];
    }

    return null;
  },

  goForward: () => {
    const { history, currentIndex } = get();

    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      set({
        currentIndex: newIndex,
        canGoBack: true,
        canGoForward: newIndex < history.length - 1,
      });
      return history[newIndex];
    }

    return null;
  },

  clear: () => {
    set({
      history: [],
      currentIndex: -1,
      canGoBack: false,
      canGoForward: false,
    });
  },
}));

