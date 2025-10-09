import { File, Folder } from 'lucide-react';
import { FileEntry } from '../../types/file';

interface FileItemProps {
  file: FileEntry;
  onSelect: (file: FileEntry) => void;
  isSelected: boolean;
}

export function FileItem({ file, onSelect, isSelected }: FileItemProps) {
  return (
    <button
      onClick={() => onSelect(file)}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-left
        hover:bg-gray-100 dark:hover:bg-gray-700
        ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
        transition-colors cursor-pointer
      `}
    >
      {file.is_directory ? (
        <Folder className="w-4 h-4 text-blue-500" />
      ) : (
        <File className="w-4 h-4 text-gray-500" />
      )}
      <span className="text-sm truncate flex-1">
        {file.name}
      </span>
    </button>
  );
}

