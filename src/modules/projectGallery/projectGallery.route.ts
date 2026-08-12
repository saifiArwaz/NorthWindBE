import { Router } from "express";
import * as projectGalleryCtrl from "./projectGallery.controller.js";
import {
  createprojectGallerySchema,
  updateprojectGallerySchema,
} from "./projectGallery.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectGallery").any();

router.get("/", projectGalleryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createprojectGallerySchema),
  projectGalleryCtrl.create,
);
router.get("/:id", projectGalleryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateprojectGallerySchema),
  projectGalleryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectGallery").none(),
  projectGalleryCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectGallery").none(),
  projectGalleryCtrl.changeStatus,
);
router.delete("/:id", projectGalleryCtrl.destroy);

export { router as projectGalleryRoutes };
