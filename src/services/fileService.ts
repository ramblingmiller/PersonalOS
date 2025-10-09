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

export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await invoke<void>('write_file', { path, content });
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

export async function createFile(path: string): Promise<void> {
  try {
    await invoke<void>('create_file', { path });
  } catch (error) {
    throw new Error(`Failed to create file: ${error}`);
  }
}

export async function createDirectory(path: string): Promise<void> {
  try {
    await invoke<void>('create_directory', { path });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error}`);
  }
}

