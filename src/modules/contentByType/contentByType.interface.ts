export interface IContentByTypeCreateDTO {
  type: string;
  title: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  status?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface IContentByTypeUpdateDTO {
  pageSlug?: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  status?: boolean;
  seoTags?: string;
  createdBy?: string;
  updatedBy?: string;
}
