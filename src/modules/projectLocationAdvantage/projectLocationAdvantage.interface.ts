export interface IProjectLocationAdvDTO {
  projectId: string;
  name: string;
  duration?: string;
  durationUnit?: string;
  createdBy?: string;
}

export interface IProjectLocationAdvUpdateDTO {
  name?: string;
  duration?: string;
  durationUnit?: string;
  updatedBy?: string;
}
