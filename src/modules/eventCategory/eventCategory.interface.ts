export interface IEventCategoryDTO {
  eventId: string;
  name: string;
  status?: boolean;
  createdBy?: string;
}

export interface IEventCategoryUpdateDTO {
  eventId?: string;
  name?: string;
  status?: boolean;
  updatedBy?: string;
}
