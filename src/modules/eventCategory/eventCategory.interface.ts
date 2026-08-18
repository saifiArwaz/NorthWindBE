export interface IEventCategoryDTO {
  eventId: string;
  name: string;
  files?: any;
  status?: boolean;
  createdBy?: string;
}

export interface IEventCategoryUpdateDTO {
  eventId?: string;
  name?: string;
  files?: any;
  status?: boolean;
  updatedBy?: string;
}
