import { Router } from "express";
import * as timelineCtrl from "./timeline.controller.js";
import {
  createTimelineSchema,
  updateTimelineSchema,
} from "./timeline.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("timeline").fields([
  { name: "desktop_image", maxCount: 1 },
  { name: "mobile_image", maxCount: 1 },
]);

router.get("/", timelineCtrl.getAll);
router.post("/", uploaded, validate(createTimelineSchema), timelineCtrl.create);
router.get("/:id", timelineCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateTimelineSchema),
  timelineCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("timeline").none(),
  timelineCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("timeline").none(),
  timelineCtrl.changeStatus,
);
router.delete("/:id", timelineCtrl.destroy);

export { router as TimelineRoutes };
