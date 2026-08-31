import { Router } from "express";
import * as controller from "./projectMasterPlanPin.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createProjectMasterPlanPinSchema,
  updateProjectMasterPlanPinSchema,
} from "./projectMasterPlanPin.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const upload = uploadMiddleware();
router.post(
  "/",
  upload.none(),
  validate(createProjectMasterPlanPinSchema),
  controller.create
);

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.patch(
  "/:id",
  upload.none(),
  validate(updateProjectMasterPlanPinSchema),
  controller.update
);

router.delete("/:id", controller.destroy);
router.patch("/:id/seq",upload.none(), controller.changeSeq);
router.patch("/:id/status",upload.none(), controller.changeStatus);

export { router as projectMasterPlanPinRoutes };
