export interface IProjectTowerDTO {
  projectId: string;
  title?: any;
  description?: any;
  link?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectTowerUpdateDTO {
  title?: any;
  description?: any;
  link?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
