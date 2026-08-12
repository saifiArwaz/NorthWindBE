export interface IAwardDTO {
  year: number;
  title: string;
  files?: string;
  organization?: string;
  shortDescription?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IAwardUpdateDTO {
  year?: number;
  title?: string;
  files?: string;
  organization?: string;
  shortDescription?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}

