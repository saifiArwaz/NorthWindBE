export interface ICitiesDTO {
  name: string;
  slug?: string;
  stateId: string;
  seoTags?: any;
  createdBy?: string;
}

export interface ICitiesUpdateDTO {
  name?: string;
  stateId?: string;
  seoTags?: any;
  updatedBy?: string;
}

