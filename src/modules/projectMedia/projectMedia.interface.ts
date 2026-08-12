import { FileType, MediaType } from "../../generated/prisma/enums.js";

export interface IProjectMediaDTO {
  projectId: string;
  mediaType: MediaType;
  fileType: FileType;
  files?: Record<string, string>;
  alt?: string;
  watermark?: string;
  link?: string;
  createdBy?: string;
}

export interface IProjectMediaUpdateDTO {
  mediaType?: MediaType;
  fileType?: FileType;
  files?: Record<string, string>;
  alt?: string;
  watermark?: string;
  link?: string;
  updatedBy?: string;
}
