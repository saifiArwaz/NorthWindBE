export interface ITimelineDTO {
  year?: string;
  title?: string;
  description?: string;
  files?: Record<string, string>;
  alt?: string;
  watermark?: string;
  createdBy?: string;
}

export interface ITimelineUpdateDTO {
  year?: string;
  title?: string;
  description?: string;
  files?: Record<string, string>;
  alt?: string;
  watermark?: string;
  updatedBy?: string;
}
