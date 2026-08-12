export interface IProjectGalleryDTO {
  projectId: string;
  type?: string;
  fileType: string;
  dateAt?: string;
  files?: string;
  link?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectGalleryUpdateDTO {
  type?: string;
  fileType?: string;
  dateAt?: string;
  link?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
