import { Router } from "express";
import * as eventGalleryCtrl from "./eventGalleries.controller.js";
import {
  createEventGallerySchema,
  updateEventGallerySchema,
  changeFeatureSchema,
} from "./eventGalleries.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("eventGalleries").any();
router.get("/", eventGalleryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createEventGallerySchema),
  eventGalleryCtrl.create,
);
router.get("/:id", eventGalleryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateEventGallerySchema),
  eventGalleryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("eventGalleries").none(),
  eventGalleryCtrl.changeSeq,
);

router.patch(
  "/:id/status",
  uploadMiddleware("eventGalleries").none(),
  eventGalleryCtrl.changeStatus,
);

router.patch(
  "/:id/isFeature",
  uploadMiddleware("eventGalleries").none(),
  validate(changeFeatureSchema),
  eventGalleryCtrl.changeFeature,
);

router.delete("/:id", eventGalleryCtrl.destroy);

export { router as EventGalleryRoutes };
