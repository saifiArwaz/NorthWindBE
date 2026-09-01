export interface ICsrGalleryCreateDTO {
  title?: string;
  categoryId: string;
  files?: Record<string, string>;
  link?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface ICsrGalleryUpdateDTO {
  title?: string;
  categoryId?: string;
  files?: Record<string, string>;
  link?: string;
  alt?: string;
  watermark?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
