export interface ICountryDTO {
  name: string;
  slug: string;
  createdBy?: string;
}

export interface ICountryUpdateDTO {
  name?: string;
  slug?: string;
  updatedBy?: string;
}
