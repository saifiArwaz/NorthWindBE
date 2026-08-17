export interface IEventCategoryDTO {
  name: string;
  status?: boolean;
  createdBy?: string;
}

export interface IEventCategoryUpdateDTO {
  name?: string;
  status?: boolean;
  updatedBy?: string;
}
