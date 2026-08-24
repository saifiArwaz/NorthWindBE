import { MediaKitType } from "../../generated/prisma/enums.js";

export interface IMediaKitDTO {
  logo?: string;
  title?: string;
  alt?: string;
  type: MediaKitType | string;
  link?: string;
  watermark?: string;
  listKit?: string;
  createdBy?: string;
}

export interface IMediaKitUpdateDTO {
  logo?: string;
  alt?: string;
  title?: string;
  type?: MediaKitType | string;
  watermark?: string;
  link?: string;
  listKit?: string;
  description?: string;
  updatedBy?: string;
}
