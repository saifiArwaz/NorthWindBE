export interface IEventDTO {
  title: string;
  slug?: string;
  type?: "album" | "gallery";
  status: boolean;
  seq?: number;
  createdBy?: string;
}

export interface IEventUpdateDTO {
  title?: string;
  slug?: string;
  type?: "album" | "gallery";
  status?: boolean;
  seq?: number;
  updatedBy?: string;
}
