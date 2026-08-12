import { Router } from "express";
import * as CareerGalleryCtrl from "./careerGallery.controller.js";
import {
  createCareerGallerySchema,
  updateCareerGallerySchema,
} from "./careerGallery.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("careerGallery").fields([
  { name: "desktop_image", maxCount: 1 },
  { name: "mobile_image", maxCount: 1 },
]);

router.get("/", CareerGalleryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createCareerGallerySchema),
  CareerGalleryCtrl.create,
);
router.get("/:id", CareerGalleryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateCareerGallerySchema),
  CareerGalleryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("careerGallery").none(),
  CareerGalleryCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("careerGallery").none(),
  CareerGalleryCtrl.changeStatus,
);
router.delete("/:id", CareerGalleryCtrl.destroy);

export { router as CareerGalleryRoutes };
