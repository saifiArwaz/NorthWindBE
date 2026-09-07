export interface IProjectZoneCreateDTO {
  projectId: string;
  name: string;
  title?: string;
  files?: any;
  alt?: string;
  watermark?: string;
  list?: any;
  createdBy?: string;
}

export interface IProjectZoneUpdateDTO {
  projectId?: string;
  name?: string;
  title?: string;
  files?: any;
  alt?: string;
  watermark?: string;
  list?: any;
  updatedBy?: string;
}

