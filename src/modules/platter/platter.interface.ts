export interface IPlatterDTO {
  name: string;
  files?: string;
  alt?: string;
  watermark?: string;
  title?: string;
  description?: string;
  seoTags?: string;
  createdBy?: string;
}

export interface IPlatterUpdateDTO {
  name?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  title?: string;
  description?: string;
  seoTags?: string;
  updatedBy?: string;
}
