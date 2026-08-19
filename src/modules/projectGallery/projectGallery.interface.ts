export interface IProjectGalleryDTO {
  projectId: string;
  fileType: string;
  files?: string;
  link?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectGalleryUpdateDTO {
  fileType?: string;
  link?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
