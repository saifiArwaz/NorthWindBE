export interface IStateDTO {
  name: string;
  slug?: string;
  status?: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IStateUpdateDTO {
  name?: string;
  slug?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
