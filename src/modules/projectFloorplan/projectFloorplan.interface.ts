export interface IProjectFloorplanDTO {
  projectId: string;
  type: string;
  towerId?: string;
  title?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectFloorplanUpdateDTO {
  projectId?: string;
  type?: string;
  towerId?: string;
  title?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
