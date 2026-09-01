export interface ICsrCategoryCreateDTO {
  name: string;
  slug?: string;
  createdBy?: string;
}

export interface ICsrCategoryUpdateDTO {
  name?: string;
  slug?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
