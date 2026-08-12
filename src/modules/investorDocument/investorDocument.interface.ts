export interface IInvestorDocumentsDTO {
  inverstorTabId: string;
  title?: string;
  type?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  sub_title?: string;
  label?: string;
  list?: string;
  createdBy?: string;
}

export interface IInvestorDocumentsUpdateDTO {
  inverstorTabId?: string;
  title?: string;
  type?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  sub_title?: string;
  label?: string;
  list?: string;
  updatedBy?: string;
}
