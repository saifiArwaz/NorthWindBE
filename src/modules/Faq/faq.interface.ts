import { FaqTypes } from "../../generated/prisma/enums.js";

export interface IFaqDTO {
  type: FaqTypes;
  question?: string;
  answer?: string;
  createdBy?: string;
}

export interface IFaqUpdateDTO {
  type?: FaqTypes;
  question?: string;
  answer?: string;
  updatedBy?: string;
}
