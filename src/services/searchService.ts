import { invoke } from '@tauri-apps/api/core';
import { FileMatch, ContentMatch } from '../types/search';

export async function initIndex(): Promise<string> {
  try {
    return await invoke<string>('init_index');
  } catch (error) {
    throw new Error(`Failed to initialize index: ${error}`);
  }
}

export async function notifyDirectoryOpened(directory: string): Promise<void> {
  try {
    await invoke<void>('notify_directory_opened', { directory });
  } catch (error) {
    throw new Error(`Failed to notify directory opened: ${error}`);
  }
}

export async function searchFiles(query: string): Promise<FileMatch[]> {
  try {
    return await invoke<FileMatch[]>('search_files', { query });
  } catch (error) {
    throw new Error(`Failed to search files: ${error}`);
  }
}

export async function searchContent(query: string): Promise<ContentMatch[]> {
  try {
    return await invoke<ContentMatch[]>('search_content', { query });
  } catch (error) {
    throw new Error(`Failed to search content: ${error}`);
  }
}

export async function resolveWikilink(
  link: string,
  currentDir: string
): Promise<string | null> {
  try {
    return await invoke<string | null>('resolve_wikilink', { link, currentDir });
  } catch (error) {
    throw new Error(`Failed to resolve wikilink: ${error}`);
  }
}

