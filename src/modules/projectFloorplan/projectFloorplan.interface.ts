export interface IProjectFloorplanDTO {
  projectId: string;
  type: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IProjectFloorplanUpdateDTO {
  type?: string;
  list?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
