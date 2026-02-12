export interface Flipbook {
  id: string;
  name: string;
  pdfFile: File;
  totalPages: number;
  createdAt: number;
}

export interface PageData {
  pageNumber: number;
  imageUrl: string;
  loaded: boolean;
}

