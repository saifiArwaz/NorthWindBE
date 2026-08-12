export interface IBlogCreateDTO {
  title?: string;
  slug?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  files?: string;
  status?: boolean;
  seoTags?: any | null;
  isFeature?: boolean;
  isHome?: boolean;
  createdBy?: string;
  updatedBy?: string;
  dateAt?: string;
}

export interface IBlogUpdateDTO {
  title?: string;
  slug?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  files?: string;
  status?: boolean;
  seoTags?: any | null;
  isFeature?: boolean;
  isHome?: boolean;
  dateAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
