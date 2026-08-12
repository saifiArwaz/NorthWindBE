export interface ITestimonialCreateDTO {
  type: string;
  name: string;
  designation?: string;
  fileType: string;
  location?: string;
  companyName?: string;
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
  type?: string;
  name?: string;
  designation?: string;
  fileType?: string;
  location?: string;
  companyName?: string;
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
