export interface IValuesDTO {
  key: string;
  title: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IValuesUpdateDTO {
  key: string;
  title?: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  status?: boolean;
  updatedBy?: string;
}
