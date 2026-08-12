import { csrContentTypes, FileType } from "../../generated/prisma/enums.js";

export interface IcsrContentGalleriesCreateDTO {
  type: csrContentTypes;
  fileType?: FileType;
  alt?: string;
  files?: Record<string, string>;
  watermark?: string;
  link?: string;
  status?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface IcsrContentGalleriesUpdateDTO {
  type?: csrContentTypes;
  fileType?: FileType;
  alt?: string;
  files?: Record<string, string>;
  watermark?: string;
  link?: string;
  status?: boolean;
  updatedBy?: string;
}
