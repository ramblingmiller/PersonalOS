import { useFileStore } from '../../stores/fileStore';
import { FileItem } from './FileItem';
import { Loader2 } from 'lucide-react';

export function FileTree() {
  const { files, selectedFile, selectFile, isLoading, error } = useFileStore();

  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No files in this directory
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          onSelect={selectFile}
          isSelected={selectedFile?.path === file.path}
        />
      ))}
    </div>
  );
}

