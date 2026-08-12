export interface IPartnerCategoriesDTO {
  name: string;
  status?: boolean;
  createdBy?: string;
}

export interface IPartnerCategoriesUpdateDTO {
  name?: string;
  status?: boolean;
  updatedBy?: string;
}
