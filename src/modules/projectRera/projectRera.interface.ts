export interface IProjectReraDTO {
  projectId: string;
  files?: string;
  alt?: string;
  watermark?: string;
  phase?: string;
  reraNumber?: string;
  createdBy?: string;
}

export interface IProjectReraUpdateDTO {
  files?: string;
  alt?: string;
  watermark?: string;
  phase?: string;
  reraNumber?: string;
  updatedBy?: string;
}
