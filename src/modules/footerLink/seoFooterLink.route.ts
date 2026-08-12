import { Router } from "express";
import * as footerLinkCtrl from "./seoFooterLink.controller.js";
import {
  createSeoFooterLinkSchema,
  updateSeoFooterLinkSchema,
} from "./seoFooterLink.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("footerLink").none();

router.get("/", footerLinkCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createSeoFooterLinkSchema),
  footerLinkCtrl.create,
);
router.get("/:id", footerLinkCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateSeoFooterLinkSchema),
  footerLinkCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("footerLink").none(),
  footerLinkCtrl.changeStatus,
);
router.delete("/:id", footerLinkCtrl.remove);

export { router as SeoFooterLinkRoutes };
