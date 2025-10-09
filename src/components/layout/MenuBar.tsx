import { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../../stores/fileStore';
import { 
  FilePlus, 
  FolderPlus, 
  Save, 
  X,
  Undo2,
  Redo2,
  Search,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  Info
} from 'lucide-react';

type MenuId = 'file' | 'edit' | 'view' | 'help' | null;

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { 
    selectedFile,
    isFileDirty,
    saveFile,
  } = useFileStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  // Detect and sync dark mode state
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Watch for dark mode changes from other sources
    const observer = new MutationObserver(() => {
      const currentDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(currentDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleMenu = (menu: MenuId) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const handleNewFile = () => {
    // Trigger new file creation
    const event = new CustomEvent('menuaction', { detail: 'new-file' });
    window.dispatchEvent(event);
    closeMenu();
  };

  const handleNewFolder = () => {
    const event = new CustomEvent('menuaction', { detail: 'new-folder' });
    window.dispatchEvent(event);
    closeMenu();
  };

  const handleSave = () => {
    if (selectedFile && !selectedFile.is_directory && isFileDirty) {
      saveFile();
    }
    closeMenu();
  };

  const handleCloseFile = () => {
    const event = new CustomEvent('menuaction', { detail: 'close-file' });
    window.dispatchEvent(event);
    closeMenu();
  };

  const handleToggleSidebar = () => {
    const event = new CustomEvent('menuaction', { detail: 'toggle-sidebar' });
    window.dispatchEvent(event);
    closeMenu();
  };

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    console.log('Toggling dark mode:', { from: isDarkMode, to: newMode });
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Dark mode enabled, classList:', document.documentElement.classList.toString());
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Light mode enabled, classList:', document.documentElement.classList.toString());
    }
    closeMenu();
  };

  const handleAbout = () => {
    const event = new CustomEvent('menuaction', { detail: 'about' });
    window.dispatchEvent(event);
    closeMenu();
  };

  return (
    <div ref={menuRef} className="flex items-center h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 text-sm">
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('file')}
          className={`px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
            activeMenu === 'file' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          File
        </button>
        
        {activeMenu === 'file' && (
          <div 
            className="absolute top-full left-0 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl py-1 z-50"
            style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', opacity: 1 }}
          >
            <MenuItem
              icon={<FilePlus className="w-4 h-4" />}
              label="New File"
              shortcut="Ctrl+N"
              onClick={handleNewFile}
            />
            <MenuItem
              icon={<FolderPlus className="w-4 h-4" />}
              label="New Folder"
              onClick={handleNewFolder}
            />
            <MenuDivider />
            <MenuItem
              icon={<Save className="w-4 h-4" />}
              label="Save"
              shortcut="Ctrl+S"
              onClick={handleSave}
              disabled={!selectedFile || selectedFile.is_directory || !isFileDirty}
            />
            <MenuDivider />
            <MenuItem
              icon={<X className="w-4 h-4" />}
              label="Close File"
              shortcut="Ctrl+W"
              onClick={handleCloseFile}
              disabled={!selectedFile}
            />
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('edit')}
          className={`px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
            activeMenu === 'edit' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          Edit
        </button>
        
        {activeMenu === 'edit' && (
          <div 
            className="absolute top-full left-0 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl py-1 z-50"
            style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', opacity: 1 }}
          >
            <MenuItem
              icon={<Undo2 className="w-4 h-4" />}
              label="Undo"
              shortcut="Ctrl+Z"
              onClick={closeMenu}
              disabled={!selectedFile}
            />
            <MenuItem
              icon={<Redo2 className="w-4 h-4" />}
              label="Redo"
              shortcut="Ctrl+Shift+Z"
              onClick={closeMenu}
              disabled={!selectedFile}
            />
            <MenuDivider />
            <MenuItem
              icon={<Search className="w-4 h-4" />}
              label="Find"
              shortcut="Ctrl+F"
              onClick={closeMenu}
              disabled={!selectedFile}
            />
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('view')}
          className={`px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
            activeMenu === 'view' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          View
        </button>
        
        {activeMenu === 'view' && (
          <div 
            className="absolute top-full left-0 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl py-1 z-50"
            style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', opacity: 1 }}
          >
            <MenuItem
              icon={<PanelLeft className="w-4 h-4" />}
              label="Toggle Sidebar"
              shortcut="Ctrl+B"
              onClick={handleToggleSidebar}
            />
            <MenuDivider />
            <MenuItem
              icon={isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              onClick={handleToggleDarkMode}
            />
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('help')}
          className={`px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
            activeMenu === 'help' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          Help
        </button>
        
        {activeMenu === 'help' && (
          <div 
            className="absolute top-full left-0 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl py-1 z-50"
            style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', opacity: 1 }}
          >
            <MenuItem
              icon={<Info className="w-4 h-4" />}
              label="About PersonalOS"
              onClick={handleAbout}
            />
          </div>
        )}
      </div>

      {/* Right side - file status */}
      <div className="flex-1" />
      {selectedFile && !selectedFile.is_directory && (
        <div className="text-xs text-gray-500 dark:text-gray-400 pr-2">
          {selectedFile.name}
          {isFileDirty && <span className="text-red-500 ml-1">●</span>}
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, disabled }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-left
        ${disabled 
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
        }
      `}
    >
      <div className="flex items-center gap-2">
        {icon && <span className={disabled ? 'opacity-50' : ''}>{icon}</span>}
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
}

