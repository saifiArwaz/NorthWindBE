export interface ISubTypologyDTO {
  name: string;
  slug: string;
  createdBy?: string;
}

export interface ISubTypologyUpdateDTO {
  name?: string;
  slug?: string;
  updatedBy?: string;
}
