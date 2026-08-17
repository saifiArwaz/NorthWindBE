export interface IHomeLoanDTO {
  link: string;
  name?: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IHomeLoanUpdateDTO {
  link?: string;
  files?: Record<string, unknown>;
  name?: string;
  alt?: string;
  watermark?: string;
  status?: boolean;
  updatedBy?: string;
}
