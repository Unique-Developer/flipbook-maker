import { Flipbook } from '../types';

const STORAGE_KEY = 'flipbooks';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

/**
 * Generate unique ID for flipbook
 */
export function generateFlipbookId(): string {
  // Generate a simple UUID-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get all flipbooks from localStorage
 */
export function getFlipbooks(): Flipbook[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const flipbooks = JSON.parse(stored);
    return flipbooks.filter((fb: Flipbook) => {
      // Filter out flipbooks that might have expired or corrupted data
      return fb.id && fb.name && fb.totalPages;
    });
  } catch (error) {
    console.error('Error reading flipbooks from storage:', error);
    return [];
  }
}

/**
 * Save flipbook metadata to localStorage
 * Note: We only store metadata, not the actual PDF file
 */
export function saveFlipbook(flipbook: Omit<Flipbook, 'pdfFile'>): void {
  try {
    const flipbooks = getFlipbooks();
    const existingIndex = flipbooks.findIndex(fb => fb.id === flipbook.id);
    
    if (existingIndex >= 0) {
      flipbooks[existingIndex] = flipbook as Flipbook;
    } else {
      flipbooks.push(flipbook as Flipbook);
    }
    
    // Check storage size (rough estimate)
    const dataSize = JSON.stringify(flipbooks).length;
    if (dataSize > MAX_STORAGE_SIZE) {
      // Remove oldest flipbooks
      flipbooks.sort((a, b) => a.createdAt - b.createdAt);
      while (JSON.stringify(flipbooks).length > MAX_STORAGE_SIZE * 0.8) {
        flipbooks.shift();
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flipbooks));
  } catch (error) {
    console.error('Error saving flipbook to storage:', error);
  }
}

/**
 * Get flipbook by ID
 */
export function getFlipbookById(id: string): Flipbook | null {
  const flipbooks = getFlipbooks();
  return flipbooks.find(fb => fb.id === id) || null;
}

/**
 * Delete flipbook from storage
 */
export function deleteFlipbook(id: string): void {
  try {
    const flipbooks = getFlipbooks();
    const filtered = flipbooks.filter(fb => fb.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting flipbook:', error);
  }
}

/**
 * Generate shareable link
 */
export function generateShareLink(flipbookId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#/flipbook/${flipbookId}`;
}

