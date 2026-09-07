export interface IInvestorAppreciationCreateDTO {
  year: string;
  bsp: string;
  createdBy?: string;
}

export interface IInvestorAppreciationUpdateDTO {
  year?: string;
  bsp?: string;
  updatedBy?: string;
}
