export interface ICitiesDTO {
  name: string;
  slug?: string;
  seoTags?: any;
  createdBy?: string;
}

export interface ICitiesUpdateDTO {
  name?: string;
  seoTags?: any;
  updatedBy?: string;
}
