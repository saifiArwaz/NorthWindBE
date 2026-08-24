import { Router } from "express";
import * as socialLinkCtrl from "./socialLink.controller.js";
import {
  createSocialLinkSchema,
  updateSocialLinkSchema,
} from "./socialLink.schema.js";
import { validate } from "../../middlewares/validate.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", socialLinkCtrl.getAll);
router.post(
  "/",
  upload.none(),
  validate(createSocialLinkSchema),
  socialLinkCtrl.create,
);
router.get("/:id", socialLinkCtrl.getOne);
router.patch(
  "/:id",
  upload.none(),
  validate(updateSocialLinkSchema),
  socialLinkCtrl.update,
);
router.patch("/:id/status", upload.none(), socialLinkCtrl.changeStatus);
router.patch(
  "/:id/seq",
  upload.none(),
  socialLinkCtrl.changeSeq,
);
router.delete("/:id", socialLinkCtrl.remove);

export { router as SocialLinkRoutes };
