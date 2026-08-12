import { Router } from "express";
import * as testimonialCtrl from "./testimonial.controller.js";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from "./testimonial.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("testimonial").fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.get("/", testimonialCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createTestimonialSchema),
  testimonialCtrl.create,
);
router.get("/:id", testimonialCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateTestimonialSchema),
  testimonialCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("testimonial").none(),
  testimonialCtrl.changeSeq,
);
router.patch(
  "/:id/feature",
  uploadMiddleware("testimonial").none(),
  testimonialCtrl.chooseFeatureTestimonial,
);
router.patch(
  "/:id/isFeature",
  uploadMiddleware("testimonial").none(),
  testimonialCtrl.chooseFeatureTestimonial,
);
router.patch(
  "/:id/isHome",
  uploadMiddleware("testimonial").none(),
  testimonialCtrl.chooseHomeTestimonial,
);
router.patch(
  "/:id/status",
  uploadMiddleware("testimonial").none(),
  testimonialCtrl.changeStatus,
);
router.delete("/:id", testimonialCtrl.destroy);

export { router as TestimonialRoutes };
