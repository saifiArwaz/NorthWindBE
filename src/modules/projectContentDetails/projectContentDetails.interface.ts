export interface IProjectContentDetailsCreateDTO {
  projectId: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  createdBy: string;
  updatedBy: string;
}

export interface IProjectContentDetailsUpdateDTO {
  projectId?: string;
  title?: string;
  description?: string;
  files?: Record<string, any>;
  alt?: string;
  watermark?: string;
  updatedBy: string;
}
