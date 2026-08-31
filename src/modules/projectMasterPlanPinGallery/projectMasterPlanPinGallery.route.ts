import { Router } from "express";
import * as controller from "./projectMasterPlanPinGallery.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createProjectMasterPlanPinGallerySchema,
  updateProjectMasterPlanPinGallerySchema,
} from "./projectMasterPlanPinGallery.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("projectMasterPlanPinGallery").any();

router.post(
  "/",
  uploaded,
  validate(createProjectMasterPlanPinGallerySchema),
  controller.create
);

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.patch(
  "/:id",
  uploaded,
  validate(updateProjectMasterPlanPinGallerySchema),
  controller.update
);

router.delete("/:id", controller.destroy);

router.patch("/:id/seq",uploadMiddleware("projectMasterPlanPinGallery").none(), controller.changeSeq);

router.patch("/:id/status",uploadMiddleware("projectMasterPlanPinGallery").none(), controller.changeStatus);

export { router as projectMasterPlanPinGalleryRoutes };
