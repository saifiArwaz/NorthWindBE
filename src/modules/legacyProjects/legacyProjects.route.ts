import { Router } from "express";
import * as legacyProjectCtrl from "./legacyProjects.controller.js";
import {
  createLegacyProjectSchema,
  updateLegacyProjectSchema,
} from "./legacyProjects.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("legacyProjects").any();

router.get("/", legacyProjectCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createLegacyProjectSchema),
  legacyProjectCtrl.create,
);
router.get("/:id", legacyProjectCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateLegacyProjectSchema),
  legacyProjectCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("legacyProjects").none(),
  legacyProjectCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("legacyProjects").none(),
  legacyProjectCtrl.changeStatus,
);
router.delete("/:id", legacyProjectCtrl.destroy);

export { router as LegacyProjectRoutes };
