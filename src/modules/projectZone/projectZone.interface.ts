export interface IProjectZoneCreateDTO {
  projectId: string;
  name: string;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectZoneUpdateDTO {
  projectId?: string;
  name?: string;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}

