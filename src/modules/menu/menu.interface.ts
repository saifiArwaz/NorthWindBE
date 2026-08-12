export interface IMenuItemDTO {
  label: string;
  pageId?: string;
  parentId?: string;
  createdBy?: string;
}

export interface IMenuItemUpdateDTO {
  label?: string;
  pageId?: string;
  parentId?: string;
  updatedBy?: string;
}
