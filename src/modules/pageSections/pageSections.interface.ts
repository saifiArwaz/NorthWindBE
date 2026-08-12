export interface IPageSectionCreateDTO {
  pageSlug: string;
  type: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  link?: string;
  list?: string;
  status?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface IPageSectionUpdateDTO {
  pageSlug?: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  type?: string;
  watermark?: string;
  link?: string;
  list?: string;
  status?: boolean;
  seoTags?: string;
  createdBy?: string;
  updatedBy?: string;
}
