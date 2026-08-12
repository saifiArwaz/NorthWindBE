import { Router } from "express";
import * as seoPageCtrl from "./seoPage.controller.js";
import { createSeoPageSchema, updateSeoPageSchema } from "./seoPage.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("seoPage").none();

router.get("/:footerId/list", seoPageCtrl.getAll);
router.post("/", uploaded, seoPageCtrl.create);
router.get("/:id", seoPageCtrl.getOne);
router.patch("/:id", uploaded, seoPageCtrl.update);
router.patch(
  "/:id/status",
  uploadMiddleware("seoPage").none(),
  seoPageCtrl.changeStatus,
);
router.delete("/:id", seoPageCtrl.remove);

export { router as SeoPageRoutes };
