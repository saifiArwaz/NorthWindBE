import { Router } from "express";
import * as projectBannerCtrl from "./projectBanner.controller.js";
import {
  createProjectBannerSchema,
  updateProjectBannerSchema,
} from "./projectBanner.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectBanner").fields([
  { name: "desktop_image", maxCount: 1 },
  { name: "mobile_image", maxCount: 1 },
]);

router.get("/", projectBannerCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createProjectBannerSchema),
  projectBannerCtrl.create,
);
router.get("/:id", projectBannerCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateProjectBannerSchema),
  projectBannerCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectBanner").none(),
  projectBannerCtrl.changeSeq,
);
router.patch(
  "/:id/banner",
  uploadMiddleware("projectBanner").none(),
  projectBannerCtrl.chooseBannerProject,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectBanner").none(),
  projectBannerCtrl.changeStatus,
);
router.delete("/:id", projectBannerCtrl.destroy);

export { router as ProjectBannerRoutes };
