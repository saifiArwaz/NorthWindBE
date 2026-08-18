import { Router } from "express";
import * as instagramReelCtrl from "./instagramReel.controller.js";
import { createInstagramReelSchema } from "./instagramReel.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const noneUpload = uploadMiddleware("instagramReel").none();

router.get("/access_token", instagramReelCtrl.getAllReels);

router.get("/all-reels", instagramReelCtrl.getAllReels);
router.get("/", instagramReelCtrl.getAll);
router.post(
  "/",
  noneUpload,
  validate(createInstagramReelSchema),
  instagramReelCtrl.create,
);
router.patch("/:id/seq", noneUpload, instagramReelCtrl.changeSeq);
router.patch(
  "/:id/isDisplay",
  noneUpload,
  instagramReelCtrl.chooseReelForDisplay,
);
router.patch(
  "/:id/status",
  uploadMiddleware("instagramReel").none(),
  instagramReelCtrl.changeStatus,
);
router.delete("/:id", instagramReelCtrl.remove);

export { router as InstagramReelRoutes };
