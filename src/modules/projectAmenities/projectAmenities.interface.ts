export interface IProjectAmenitiesCreateDTO {
  projectId: string;
  title: string;
  files?: any;
  alt?: string;
  watermark?: string;
  status?: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IProjectAmenitiesUpdateDTO {
  projectId?: string;
  title?: string;
  files?: any;
  alt?: string;
  watermark?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
