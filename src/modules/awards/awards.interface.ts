export interface IAwardDTO {
  title: string;
  publication?: string;
  files?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IAwardUpdateDTO {
  title?: string;
  publication?: string;
  files?: string;
  description?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}

