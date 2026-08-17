export interface IPartnersDTO {
  link: string;
  title?: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IPartnersUpdateDTO {
  link?: string;
  files?: Record<string, unknown>;
  title?: string;
  alt?: string;
  watermark?: string;
  status?: boolean;
  updatedBy?: string;
}
