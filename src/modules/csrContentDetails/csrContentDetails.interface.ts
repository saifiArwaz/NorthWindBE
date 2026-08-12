export interface IcsrContentDetailDTO {
  title: string;
  files?: string;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  createdBy?: string;
}

export interface IcsrContentDetailUpdateDTO {
  title?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  updatedBy?: string;
}
