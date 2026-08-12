import { Router } from "express";
import * as blogCtrl from "./blogs.controller.js";
import { createPageSchema, updatePageSchema } from "./blogs.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("blogs").fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

router.get("/", blogCtrl.getAll);
router.post("/", uploaded, validate(createPageSchema), blogCtrl.create);
router.get("/:id", blogCtrl.getOne);
router.patch("/:id", uploaded, validate(updatePageSchema), blogCtrl.update);
router.patch(
  "/:id/status",
  uploadMiddleware("blogs").none(),
  blogCtrl.changeStatus,
);
router.patch(
  "/:id/isLatest",
  uploadMiddleware("blogs").none(),
  blogCtrl.changeisLatest,
);
router.patch(
  "/:id/isFeature",
  uploadMiddleware("blogs").none(),
  blogCtrl.changeisFeatured,
);
router.patch(
  "/:id/isHome",
  uploadMiddleware("blogs").none(),
  blogCtrl.changeisHome,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("blogs").none(),
  blogCtrl.changeSeq,
);
router.delete("/:id", blogCtrl.deleteById);

export { router as BlogRoutes };
