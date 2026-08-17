import { Router } from "express";
import * as eventGalleryCtrl from "./eventGalleries.controller.js";
import {
  createEventGallerySchema,
  updateEventGallerySchema,
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

router.delete("/:id", eventGalleryCtrl.destroy);

export { router as EventGalleryRoutes };
