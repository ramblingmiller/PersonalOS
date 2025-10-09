import { invoke } from '@tauri-apps/api/core';
import { FileEntry } from '../types/file';

export async function getHomeDirectory(): Promise<string> {
  try {
    return await invoke<string>('get_home_directory');
  } catch (error) {
    throw new Error(`Failed to get home directory: ${error}`);
  }
}

export async function readDirectory(path: string): Promise<FileEntry[]> {
  try {
    return await invoke<FileEntry[]>('read_directory', { path });
  } catch (error) {
    throw new Error(`Failed to read directory: ${error}`);
  }
}

export async function readFile(path: string): Promise<string> {
  try {
    return await invoke<string>('read_file', { path });
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

