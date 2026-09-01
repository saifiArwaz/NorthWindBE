export interface IInstagramReelCreateDTO {
  reelId: string;
  thumbnail_url?: string;
  isDisplay?: boolean;
  createdBy?: string;
}

export interface IInstagramReelUpdateDTO {
  reelId?: string;
  thumbnail_url?: string;
  updatedBy?: string;
}
