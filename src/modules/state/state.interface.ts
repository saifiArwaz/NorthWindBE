export interface IStateDTO {
  countryId: string;
  name: string;
  slug: string;
  createdBy?: string;
}

export interface IStateUpdateDTO {
  name?: string;
  slug?: string;
  updatedBy?: string;
}
