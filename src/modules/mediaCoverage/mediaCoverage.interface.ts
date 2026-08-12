export interface IMediaCoverageDTO {
  title?: string;
  mediaType?: string;
  dateAt?: string;
  description?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  createdBy?: string;
}

export interface IMediaCoverageUpdateDTO {
  title?: string;
  mediaType?: string;
  dateAt?: string;
  description?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  updatedBy?: string;
}
