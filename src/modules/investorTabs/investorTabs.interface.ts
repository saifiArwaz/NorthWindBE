export interface IInvestorTabsDTO {
  title: string;
  files?: string;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface IInvestorTabsUpdateDTO {
  title?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
