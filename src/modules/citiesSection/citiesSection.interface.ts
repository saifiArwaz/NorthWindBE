export interface ICitySectionListCreateDTO {
  cityId: string;
  sectionType: string;
  title: string;
  files?: string;
  alt?: string;
  description?: string;
  list?: string;
  createdBy: string;
  updatedBy: string;
}

export interface ICitySectionListUpdateDTO {
  cityId?: string;
  title?: string;
  files?: Record<string, any>;
  alt?: string;
  description?: string;
  list?: string;
  updatedBy: string;
}
