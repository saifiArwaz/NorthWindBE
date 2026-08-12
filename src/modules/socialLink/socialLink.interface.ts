export interface ISocialLinkDTO {
  key: string;
  socialLink: string;
  createdBy?: string;
}

export interface ISocialLinkUpdateDTO {
  key?: string;
  socialLink?: string;
  updatedBy?: string;
}
