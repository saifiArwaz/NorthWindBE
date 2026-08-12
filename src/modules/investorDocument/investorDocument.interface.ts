export type InvestorDocumentType = "new_release" | "annual" | "quarterly";

export interface IInvestorDocumentsDTO {
  title: string;
  type?: InvestorDocumentType;
  dateAt?: string;
  files?: string;
  createdBy?: string;
}

export interface IInvestorDocumentsUpdateDTO {
  title?: string;
  type?: InvestorDocumentType;
  dateAt?: string;
  files?: string;
  updatedBy?: string;
}
