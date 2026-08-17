import { FileType } from "../../generated/prisma/enums.js";

export interface IEventsGalleryDTO {
  fileType?: FileType | string;
  categoryId: string;
  files?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IEventsGalleryUpdateDTO {
  fileType?: FileType | string;
  categoryId?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
