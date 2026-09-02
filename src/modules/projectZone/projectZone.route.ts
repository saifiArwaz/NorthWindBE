import { Router } from "express";
import * as projectZoneCtrl from "./projectZone.controller.js";
import {
  createProjectZoneSchema,
  updateProjectZoneSchema,
} from "./projectZone.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectZone").fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

router.get("/", projectZoneCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createProjectZoneSchema),
  projectZoneCtrl.create,
);
router.get("/:id", projectZoneCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateProjectZoneSchema),
  projectZoneCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectZone").none(),
  projectZoneCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectZone").none(),
  projectZoneCtrl.changeStatus,
);
router.delete("/:id", projectZoneCtrl.destroy);

export { router as ProjectZoneRoutes };
