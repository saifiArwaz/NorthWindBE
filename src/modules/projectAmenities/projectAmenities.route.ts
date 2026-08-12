import { Router } from "express";
import * as projectAmenitiesCtrl from "./projectAmenities.controller.js";
import {
  createProjectAmenitiesSchema,
  updateProjectAmenitiesSchema,
} from "./projectAmenities.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectAmenities").fields([
  { name: "image", maxCount: 1 },
]);

router.get("/", projectAmenitiesCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createProjectAmenitiesSchema),
  projectAmenitiesCtrl.create,
);
router.get("/:id", projectAmenitiesCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateProjectAmenitiesSchema),
  projectAmenitiesCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectAmenities").none(),
  projectAmenitiesCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectAmenities").none(),
  projectAmenitiesCtrl.changeStatus,
);
router.delete("/:id", projectAmenitiesCtrl.destroy);

export { router as ProjectAmenitiesRoutes };
