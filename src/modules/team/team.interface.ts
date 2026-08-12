export interface ITeamDTO {
  name: string;
  designation: string;
  files?: string;
  alt?: string;
  watermark?: string;
  description?: string;
  createdBy?: string;
}

export interface ITeamUpdateDTO {
  name?: string;
  designation?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  description?: string;
  updatedBy?: string;
}
