export interface INewsDTO {
  title: string;
  logo?: string;
  alt?: string;
  watermark?: string;
  newsLink: string;
  dateAt?: string;
  createdBy?: string;
}

export interface INewsUpdateDTO {
  title?: string;
  logo?: string;
  alt?: string;
  watermark?: string;
  newsLink?: string;
  dateAt?: string;
  updatedBy?: string;
}
