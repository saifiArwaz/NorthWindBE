export interface ITestimonialCreateDTO {
  name?: string;
  fileType: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  description?: string;
  isFeature?: boolean;
  isHome?: boolean;
  status?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface ITestimonialUpdateDTO {
  name?: string;
  fileType?: string;
  files?: string;
  alt?: string;
  watermark?: string;
  link?: string;
  description?: string;
  isFeature?: boolean;
  isHome?: boolean;
  status?: boolean;
  updatedBy?: string;
}
