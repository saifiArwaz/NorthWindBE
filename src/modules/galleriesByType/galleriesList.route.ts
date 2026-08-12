import { Router } from "express";
import * as GalleriesList from "./galleriesList.controller.js";
import {
  createGalleriesListSchema,
  updateGalleriesListSchema,
} from "./galleriesList.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("galleriesByType").any();

router.get("/:type/list", GalleriesList.getAll);
router.post(
  "/",
  uploaded,
  validate(createGalleriesListSchema),
  GalleriesList.create,
);
router.get("/:id", GalleriesList.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateGalleriesListSchema),
  GalleriesList.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("galleriesByType").none(),
  GalleriesList.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("galleriesByType").none(),
  GalleriesList.changeStatus,
);
router.delete("/:id", GalleriesList.destroy);

export { router as GalleriesListRoutes };
