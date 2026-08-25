export interface IContentByTypeCreateDTO {
  type: string;
  title: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IContentByTypeUpdateDTO {
  pageSlug?: string;
  type?: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  createdBy?: string;
  updatedBy?: string;
}
