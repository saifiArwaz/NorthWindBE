import { FileType } from "../../generated/prisma/enums.js";

export interface IConstructionGalleryDTO {
  projectId?: string;
  year?: string;
  fileType?: FileType | string;
  files?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IConstructionGalleryUpdateDTO {
  projectId?: string;
  year?: string;
  fileType?: FileType | string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
