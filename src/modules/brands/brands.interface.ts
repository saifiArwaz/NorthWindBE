export interface IBrandsDTO {
  link: string;
  files?: Record<string, unknown>;
  alt?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IBrandsUpdateDTO {
  link?: string;
  files?: Record<string, unknown>;
  alt?: string;
  status?: boolean;
  updatedBy?: string;
}
