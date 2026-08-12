export interface ITypologyDTO {
  name: string;
  slug: string;
  createdBy?: string;
}

export interface ITypologyUpdateDTO {
  name: string;
  slug: string;
  updatedBy?: string;
}
