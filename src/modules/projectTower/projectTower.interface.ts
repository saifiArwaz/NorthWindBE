export interface IProjectTowerDTO {
  projectId: string;
  name: string;
  slug?: string;
  title?: any;
  description?: any;
  link?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IProjectTowerUpdateDTO {
  name?: string;
  slug?: string;
  title?: any;
  description?: any;
  link?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
