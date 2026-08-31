export interface IProjectsCreateDTO {
  projectName: string;
  slug: string;
  platterId: string;
  typologyId?: string;
  subTypologyId?: string[];
  projectStatusId: string;
  cityId?: string;
  location?: string;
  files?: string;
  brochure?: string;
  alt?: string;
  watermark?: string;
  type?: string;
  shortDescription?: string;
  otherDetails?: any | null;
  seoTags?: any | null;
  createdBy: string;
  updatedBy: string;
}

export interface IProjectsUpdateDTO {
  projectName?: string;
  slug?: string;
  platterId?: string;
  typologyId?: string;
  subTypologyId?: string[];
  projectStatusId?: string;
  cityId?: string;
  location?: string;
  files?: Record<string, any>;
  brochure?: string;
  alt?: string;
  watermark?: string;
  type?: string;
  shortDescription?: string;
  otherDetails?: any | null;
  seoTags?: any | null;
  updatedBy?: string;
}
