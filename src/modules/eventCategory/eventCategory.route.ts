import { Router } from "express";
import * as eventCategoryCtrl from "./eventCategory.controller.js";
import {
  createEventCategorySchema,
  updateEventCategorySchema,
} from "./eventCategory.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("mediaCoverage").fields([
  { name: "coverImage", maxCount: 1 },
]);

router.get("/", eventCategoryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createEventCategorySchema),
  eventCategoryCtrl.create,
);
router.get("/:id", eventCategoryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
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
