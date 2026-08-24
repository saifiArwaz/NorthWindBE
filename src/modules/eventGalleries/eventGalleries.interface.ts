import { FileType } from "../../generated/prisma/enums.js";
export interface IEventsGalleryDTO {
  title?: string;
  fileType?: FileType | string;
  categoryId?: string;
  eventId?: string;
  files?: Record<string, string> | any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IEventsGalleryUpdateDTO {
  title?: string;
  fileType?: FileType | string;
  categoryId?: string;
  eventId?: string;
  files?: Record<string, string> | any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
