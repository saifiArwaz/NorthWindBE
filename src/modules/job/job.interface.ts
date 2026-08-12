export interface IJobDTO {
  title: string;
  designation?: string;
  location?: any;
  description?: any;
  jobType?: string;
  skills?: string[];
  qualifications?: string[];
  createdBy?: string;
}

export interface IJobUpdateDTO {
  title?: string;
  designation?: string;
  location?: any;
  description?: any;
  jobType?: string;
  skills?: string[];
  qualifications?: string[];
  updatedBy?: string;
}

