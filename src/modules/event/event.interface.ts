export interface IEventDTO {
  title: string;
  status: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IEventUpdateDTO {
  title?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
