export interface ILocalityDTO {
  name: string;
  cityId: string;
}

export interface ILocalityUpdateDTO {
  name?: string;
  cityId?: string;
  status?: boolean;
}
