export interface IJobDTO {
  title: string;
  location?: any;
  description?: any;
  jobType?: string;
  createdBy?: string;
}

export interface IJobUpdateDTO {
  title?: string;
  location?: any;
  description?: any;
  jobType?: string;
  updatedBy?: string;
}

