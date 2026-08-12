export interface IProjectLocationAdvDTO {
  projectId: string;
  duration?: string;
  destination: string;
  createdBy?: string;
}

export interface IProjectLocationAdvUpdateDTO {
  duration?: string;
  destination?: string;
  updatedBy?: string;
}
