export interface IProjectSectionCreateDTO {
  projectId: string;
  type: string;
  title: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  description?: string;
  list?: string;
  createdBy: string;
  updatedBy: string;
}

export interface IProjectSectionUpdateDTO {
  projectId?: string;
  title?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  link?: string;
  description?: string;
  list?: string;
  updatedBy: string;
}
