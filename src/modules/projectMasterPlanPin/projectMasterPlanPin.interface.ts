export interface IProjectMasterPlanPinDTO {
  projectId: string;
  categoryId?: string;
  title: string;
  coordinates?: any;
  createdBy?: string;
}

export interface IProjectMasterPlanPinUpdateDTO {
  projectId?: string;
  categoryId?: string;
  title?: string;
  coordinates?: any;
  updatedBy?: string;
}
