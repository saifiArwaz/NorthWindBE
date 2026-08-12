export interface IAmenitiesDTO {
  title: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  status?: boolean;
  createdBy?: string;
}

export interface IAmenitiesUpdateDTO {
  title?: string;
  files?: Record<string, unknown>;
  alt?: string;
  watermark?: string;
  status?: boolean;
  updatedBy?: string;
}
