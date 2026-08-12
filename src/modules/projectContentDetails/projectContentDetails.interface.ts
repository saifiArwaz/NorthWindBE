export interface IProjectContentDetailsCreateDTO {
  projectId: string;
  type: string;
  title?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  list?: Record<string, any>;
  createdBy: string;
  updatedBy: string;
}

export interface IProjectContentDetailsUpdateDTO {
  projectId?: string;
  title?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  list?: Record<string, any>;
  updatedBy: string;
}
