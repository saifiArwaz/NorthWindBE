export interface IOfficesLocationDTO {
  city: string;
  officeName: string;
  list?: string;
  createdBy?: string;
}

export interface IOfficesLocationUpdateDTO {
  city?: string;
  officeName?: string;
  list?: string;
  updatedBy?: string;
}
