export interface IPageCreateDTO {
  pageName: string;
  slug: string;
  title?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  type?: string;
  link?: string;
  files?: string;
  status?: boolean;
  seoTags?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IPageUpdateDTO {
  pageName?: string;
  title?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  type?: string;
  link?: string;
  files?: string;
  status?: boolean;
  seq?: number;
  seoTags?: string;
  createdBy?: string;
  updatedBy?: string;
}
