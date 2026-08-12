export interface ICareerGalleryCreateDTO {
  files?: string;
  alt?: string;
  createdBy: string;
  updatedBy: string;
}

export interface ICareerGalleryUpdateDTO {
  files?: string;
  alt?: string;
  updatedBy?: string;
}
