export interface ICitiesContentDetailDTO {
  type: string;
  heading: string;
  files?: string;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICitiesContentDetailUpdateDTO {
  type?: string;
  heading?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  updatedBy?: string;
}
