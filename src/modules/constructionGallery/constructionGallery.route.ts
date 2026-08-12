import { Router } from "express";
import * as constructionGalleryCtrl from "./constructionGallery.controller.js";
import {
  createconstructionGallerySchema,
  updateconstructionGallerySchema,
} from "./constructionGallery.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("constructionGallery").fields([
  { name: "file", maxCount: 1 },
  { name: "largeFile", maxCount: 1 },
]);

router.get("/", constructionGalleryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createconstructionGallerySchema),
  constructionGalleryCtrl.create,
);
router.get("/:id", constructionGalleryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateconstructionGallerySchema),
  constructionGalleryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("constructionGallery").none(),
  constructionGalleryCtrl.changeSeq,
);
router.patch(
  "/:id/feature",
  uploadMiddleware("constructionGallery").none(),
  constructionGalleryCtrl.chooseFeatureEvent,
);
router.delete("/:id", constructionGalleryCtrl.destroy);

export { router as ConstructionGalleryRoutes };
