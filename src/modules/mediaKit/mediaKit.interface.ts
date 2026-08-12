export interface IMediaKitDTO {
  logo?: string;
  title?: string;
  alt?: string;
  link?: string;
  watermark?: string;
  listKit?: string;
  createdBy?: string;
}

export interface IMediaKitUpdateDTO {
  logo?: string;
  alt?: string;
  title?: string;
  watermark?: string;
  link?: string;
  listKit?: string;
  description?: string;
  updatedBy?: string;
}
