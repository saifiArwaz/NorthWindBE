import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as partnersService from "./homeloan.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl, deleteFromS3 } from "../../utils/fileHandling.utils.js";
import type { IHomeLoanUpdateDTO } from "./homeloan.interface.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const record = await partnersService.createHomeLoan({
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  });

  if (record && record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(res, 200, "Home Loan created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as string; // Get the type from the route parameter
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await partnersService.getAllList(page, limit, search, type);

  await Promise.all(
    records.data.map(async (data: any) => {
      if (data.files && typeof data.files === "object") {
        const filesObj = data.files as any;
        await Promise.all(
          Object.keys(filesObj).map(async (key) => {
            if (filesObj[key]) {
              filesObj[key] = await getFileUrl(filesObj[key]);
            }
          }),
        );
      }
    }),
  );

  successResponse(res, 200, "Home Loan records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await partnersService.getHomeLoanById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  if (record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(res, 200, "Get Home Loan record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await partnersService.getHomeLoanById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  const filesToDelete: string[] = [];

  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        filesToDelete.push(filesByFieldname[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  if (Array.isArray((req.body as any).removeFiles)) {
    for (const field of (req.body as any).removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  const updatePayload: IHomeLoanUpdateDTO = {
    link: req.body.link,
    files: filesByFieldname,
    alt: req.body.alt,
    name: req.body.name,
    watermark: req.body.watermark,
    status:
      (req.body as any).status !== undefined
        ? (req.body as any).status === "true" ||
          (req.body as any).status === true
        : undefined,
    updatedBy: user.id,
  };

  const updatedRecord = await partnersService.updateHomeLoan(id, updatePayload);

  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  if (updatedRecord.files) {
    for (const key of Object.keys(updatedRecord.files as any)) {
      const value = (updatedRecord.files as any)[key];
      if (value) {
        (updatedRecord.files as any)[key] = await getFileUrl(value);
      }
    }
  }

  successResponse(res, 200, "Home Loan updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await partnersService.getHomeLoanById(id);

  if (!item) {
    throw new ApiError(404, "Home Loan record not found");
  }

  // const fileFields: string[] = [];
  // if (item.files && typeof item.files === "object") {
  //   const filesObj = item.files as any;
  //   for (const key of Object.keys(filesObj)) {
  //     if (filesObj[key]) {
  //       fileFields.push(filesObj[key]);
  //     }
  //   }
  // }

  // for (const file of fileFields) {
  //   file && (await deleteFromS3(file));
  // }

  await partnersService.deleteHomeLoan(id);
  successResponse(res, 200, "Home Loan record deleted successfully");
});

export const changeStatus = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { status } = req.body;

    if (
      !(
        typeof status === "boolean" ||
        status === "true" ||
        status === "false" ||
        status === 1 ||
        status === 0 ||
        status === "1" ||
        status === "0"
      )
    ) {
      throw new ApiError(
        400,
        "status value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof status === "string") {
      if (status === "true") status = true;
      else if (status === "false") status = false;
      else if (status === "1") status = true;
      else if (status === "0") status = false;
    } else if (typeof status === "number") {
      status = status === 1;
    }

    const record = (partnersService as any).getById
      ? await (partnersService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (partnersService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);


export const changeSeq = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const user = req.user!;
    const { id } = req.params;
    const { seq } = req.body;

    let payload: any = { updatedBy: user.id };

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    payload.seq = Number(seq);

    const record = await partnersService.getHomeLoanById(id);
    if (!record) {
      throw new ApiError(404, "Home Loan record not found");
    }

    const updatedProject = await partnersService.updateHomeLoanSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Home Loan seq successfully", updatedProject);
  },
);
