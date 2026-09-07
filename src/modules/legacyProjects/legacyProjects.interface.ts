import { LegacyProjectCategory } from "../../generated/prisma/enums.js";

export interface ILegacyProjectCreateDTO {
  name: string;
  category?: LegacyProjectCategory;
  location?: string;
  description?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface ILegacyProjectUpdateDTO {
  name?: string;
  category?: LegacyProjectCategory;
  location?: string;
  description?: any;
  files?: any;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
