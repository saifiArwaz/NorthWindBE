export interface IWhyIndiaDTO {
  title: string;
  files?: any;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  tags?: any;
  status?: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IWhyIndiaUpdateDTO {
  title?: string;
  files?: any;
  alt?: string;
  watermark?: string;
  shortDescription?: string;
  tags?: any;
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
