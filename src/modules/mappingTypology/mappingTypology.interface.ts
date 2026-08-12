export interface IMmappingSubTypologyDTO {
  typologyId: string;
  subTypologyId: string;
  createdBy?: string;
}

export interface ISubTypologyUpdateDTO {
  typologyId?: string;
  subTypologyId?: string;
  updatedBy?: string;
}
