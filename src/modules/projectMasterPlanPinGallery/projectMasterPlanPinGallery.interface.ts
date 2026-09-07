export interface IProjectMasterPlanPinGalleryDTO {
  pinId: string;
  title?: string;
  files?: Record<string, string> | any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectMasterPlanPinGalleryUpdateDTO {
  pinId?: string;
  title?: string;
  files?: Record<string, string> | any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
