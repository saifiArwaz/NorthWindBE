import { Router } from "express";
import * as mediaCoverageCtrl from "./mediaCoverage.controller.js";
import {
  createMediaCoverageSchema,
  updateMediaCoverageSchema,
} from "./mediaCoverage.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("mediaCoverage").fields([
  { name: "logo", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.get("/", mediaCoverageCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createMediaCoverageSchema),
  mediaCoverageCtrl.create,
);
router.get("/:id", mediaCoverageCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateMediaCoverageSchema),
  mediaCoverageCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("mediaCoverage").none(),
  mediaCoverageCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("mediaCoverage").none(),
  mediaCoverageCtrl.changeStatus,
);
router.delete("/:id", mediaCoverageCtrl.destroy);
router.patch(
  "/:id/feature",
  uploadMiddleware("mediaCoverage").none(),
  mediaCoverageCtrl.chooseFeature,
);

export { router as MediaCoverageRoutes };
