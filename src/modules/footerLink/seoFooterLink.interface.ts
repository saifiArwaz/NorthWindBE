export interface ISeoFooterLinkDTO {
  projectId?: string;
  label: string;
  slug: string;
  type: string;
  seq?: number;
}

export interface ISeoFooterLinkUpdateDTO {
  projectId?: string;
  label?: string;
  slug?: string;
  type?: string;
  seq?: number;
}
