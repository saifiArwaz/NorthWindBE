import { FileType } from "../../generated/prisma/enums.js";

export interface IEventsGalleryDTO {
  title?: string;
  fileType?: FileType | string;
  categoryId: string;
  parentGalleryId?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  isFeature?: boolean;
  status?: boolean;
  createdBy?: string;
}

export interface IEventsGalleryUpdateDTO {
  title?: string;
  fileType?: FileType | string;
  categoryId?: string;
  parentGalleryId?: string | null;
  files?: string;
  alt?: string;
  watermark?: string;
  isFeature?: boolean;
  status?: boolean;
  updatedBy?: string;
}
