export interface IProjectStatusDTO {
  name: string;
  slug: string;
  createdBy?: string;
}

export interface IProjectStatusUpdateDTO {
  name: string;
  slug: string;
  updatedBy?: string;
}
