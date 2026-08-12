export interface IBlogFaqDTO {
  blogId: string;
  question: string;
  answer: string;
  createdBy?: string;
}

export interface IBlogFaqUpdateDTO {
  question?: string;
  answer?: string;
  updatedBy?: string;
}
