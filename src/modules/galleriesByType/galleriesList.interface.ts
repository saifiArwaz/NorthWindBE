export interface IGalleriesListCreateDTO {
  fileType: string;
  type: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  createdBy: string;
  updatedBy: string;
}

export interface IGalleriesListUpdateDTO {
  fileType?: string;
  type?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  updatedBy?: string;
}
