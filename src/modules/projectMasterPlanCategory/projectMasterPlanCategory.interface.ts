export interface IProjectMasterPlanCategoryDTO {
  projectId: string;
  name: string;
  createdBy?: string;
}

export interface IProjectMasterPlanCategoryUpdateDTO {
  projectId?: string;
  name?: string;
  updatedBy?: string;
}
