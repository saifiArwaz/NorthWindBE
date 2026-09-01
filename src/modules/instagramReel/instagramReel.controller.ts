import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as instagramReelService from "./instagramReel.service.js";
import {
  getValidInstagramToken,
  refreshInstagramToken,
} from "./instagramToken.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import axios from "axios";

const IG_USER_ID = process.env.IG_USER_ID;

export const getAllReels = asyncHandler(async (req: Request, res: Response) => {
  const { after, before } = req.query;
  const targetLimit = parseInt(req.query.limit as string) || 10;

  let token = await getValidInstagramToken();

  const fetchPage = async (
    accessToken: string,
    cursorAfter?: string,
    cursorBefore?: string,
  ) => {
    return axios.get(`https://graph.instagram.com/v24.0/${IG_USER_ID}/media`, {
      params: {
        fields:
          "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp",
        limit: 50,
        ...(cursorAfter && { after: cursorAfter }),
        ...(cursorBefore && { before: cursorBefore }),
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const execute = async (accessToken: string) => {
    let currentAfter = after as string | undefined;
    let currentBefore = before as string | undefined;
    let accumulatedReels: any[] = [];
    let initialBefore: string | null = null;
    let lastAfter: string | null = null;
    let hasNext = false;
    let hasPrev = false;

    while (accumulatedReels.length < targetLimit) {
      const response = await fetchPage(
        accessToken,
        currentAfter,
        currentBefore,
      );
      const { data, paging } = response.data;

      if (!data || data.length === 0) {
        hasNext = false;
        break;
      }

      if (!initialBefore && paging?.cursors?.before) {
        initialBefore = paging.cursors.before;
      }

      const reels = data.filter(
        (item: any) => item.media_product_type === "REELS",
      );

      accumulatedReels.push(...reels);

      lastAfter = paging?.cursors?.after ?? null;
      hasNext = !!paging?.next;
      hasPrev = !!paging?.previous;

      if (accumulatedReels.length >= targetLimit || !hasNext || !lastAfter) {
        break;
      }

      currentAfter = lastAfter;
      currentBefore = undefined;
    }

    const finalReels = accumulatedReels.slice(0, targetLimit);

    return {
      reels: finalReels,
      pagination: {
        before: initialBefore,
        after: lastAfter,
        hasNextPage: hasNext,
        hasPreviousPage: hasPrev,
      },
    };
  };

  try {
    const result = await execute(token);
    successResponse(res, 200, "Instagram reels fetched", result);
  } catch (err: any) {
    if (err.response?.status === 401) {
      token = await refreshInstagramToken();
      const result = await execute(token);
      successResponse(res, 200, "Instagram reels fetched", result);
      return;
    }
    const errorMessage = err.response?.data?.error?.message || err.message;
    if (err.response?.status !== 401) {
      console.log("Instagram API Error Data:", err.response?.data);
    }
    throw new ApiError(400, errorMessage || "Failed to fetch reels");
  }
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await instagramReelService.createInstagramReel({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 200, "Instagram reel created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await instagramReelService.getAllList(page, limit, search);
  successResponse(res, 200, "Instagram reels fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await instagramReelService.getInstagramReelById(id);

  if (!record) {
    throw new ApiError(404, "Instagram reel record not found");
  }

  successResponse(res, 200, "Instagram reel fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const oldRecord = await instagramReelService.getInstagramReelById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Instagram reel record not found");
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      reelId: req.body.reelId,
      thumbnail_url: req.body.thumbnail_url,
      updatedBy: user?.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await instagramReelService.updateInstagramReel(
    id,
    updatePayload,
  );

  successResponse(res, 200, "Instagram reel updated successfully", updatedRecord);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await instagramReelService.getInstagramReelById(id);

  if (!item) {
    throw new ApiError(404, "Instagram reel record not found");
  }

  await instagramReelService.deleteInstagramReelById(id);
  successResponse(res, 200, "Instagram reel record deleted successfully");
});

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

    const record = await instagramReelService.getInstagramReelById(id);
    if (!record) {
      throw new ApiError(404, "Instagram reel record not found");
    }

    const updated = await instagramReelService.updateInstagramReelSeq(
      id,
      payload,
    );
    successResponse(
      res,
      200,
      "Instagram reel seq updated successfully",
      updated,
    );
  },
);

export const chooseReelForDisplay = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    let { isDisplay } = req.body;

    if (
      !(
        typeof isDisplay === "boolean" ||
        isDisplay === "true" ||
        isDisplay === "false" ||
        isDisplay === 1 ||
        isDisplay === 0 ||
        isDisplay === "1" ||
        isDisplay === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isDisplay value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isDisplay === "string") {
      if (isDisplay === "true") isDisplay = true;
      else if (isDisplay === "false") isDisplay = false;
      else if (isDisplay === "1") isDisplay = true;
      else if (isDisplay === "0") isDisplay = false;
    } else if (typeof isDisplay === "number") {
      isDisplay = isDisplay === 1;
    }

    const reel = await instagramReelService.getInstagramReelById(id);
    if (!reel) {
      throw new ApiError(404, "Instagram reel not found");
    }

    const updated = await instagramReelService.chooseInstagramReel(
      id,
      isDisplay,
      user?.id,
    );

    successResponse(
      res,
      200,
      "Instagram reel display flag updated successfully",
      updated,
    );
  },
);

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

    const record = await instagramReelService.getInstagramReelById(id);
    if (!record) {
      throw new ApiError(404, "Instagram reel not found");
    }

    const updatedRecord = await instagramReelService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
