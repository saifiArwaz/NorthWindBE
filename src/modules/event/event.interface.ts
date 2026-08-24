export interface IEventDTO {
  title: string;
  slug?: string;
  status: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IEventUpdateDTO {
  title?: string;
  slug?: string;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
