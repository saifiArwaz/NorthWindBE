export interface IHomeLoanAssistanceDTO {
  title: string;
  files?: Record<string, unknown> | string;
  alt?: string;
  watermark?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IHomeLoanAssistanceUpdateDTO {
  title?: string;
  files?: Record<string, unknown> | string;
  alt?: string;
  watermark?: string;
  status?: boolean;
  updatedBy?: string;
}
