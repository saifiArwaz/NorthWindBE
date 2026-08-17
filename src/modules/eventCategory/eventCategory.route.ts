import { Router } from "express";
import * as eventCategoryCtrl from "./eventCategory.controller.js";
import {
  createEventCategorySchema,
  updateEventCategorySchema,
} from "./eventCategory.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

router.get("/", eventCategoryCtrl.getAll);
router.post(
  "/",
  uploadMiddleware("eventCategory").none(),
  validate(createEventCategorySchema),
  eventCategoryCtrl.create,
);
router.get("/:id", eventCategoryCtrl.getOne);
router.patch(
  "/:id",
  uploadMiddleware("eventCategory").none(),
  validate(updateEventCategorySchema),
  eventCategoryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("eventCategory").none(),
  eventCategoryCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("eventCategory").none(),
  eventCategoryCtrl.changeStatus,
);
router.delete("/:id", eventCategoryCtrl.destroy);

export { router as EventCategoryRoutes };
