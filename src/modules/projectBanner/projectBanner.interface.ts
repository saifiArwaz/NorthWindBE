export interface IProjectBannerCreateDTO {
  projectId: string;
  files?: string;
  alt?: string;
  watermark?: string;

  createdBy: string;
  updatedBy: string;
}

export interface IProjectBannerUpdateDTO {
  projectId?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
