import { FileType } from "../../generated/prisma/enums.js";

export interface IConstructionGalleryDTO {
  projectId?: string;
  title?: string;
  dateAt?: Date;
  fileType?: FileType | string;
  files?: string;
  alt?: string;
  link?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IConstructionGalleryUpdateDTO {
  projectId?: string;
  title?: string;
  dateAt?: Date;
  fileType?: FileType | string;
  files?: string;
  alt?: string;
  link?: string;
  watermark?: string;
  updatedBy?: string;
}
