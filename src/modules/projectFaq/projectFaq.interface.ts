export interface IProjectFaqDTO {
  projectId: string;
  question?: string;
  answer?: string;
  createdBy?: string;
}

export interface IProjectFaqUpdateDTO {
  question?: string;
  answer?: string;
  updatedBy?: string;
}
