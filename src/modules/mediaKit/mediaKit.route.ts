import { Router } from "express";
import * as mediaKitCtrl from "./mediaKit.controller.js";
import {
  createMediaKitSchema,
  updateMediaKitSchema,
} from "./mediaKit.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("mediaKit").any();

router.get("/", mediaKitCtrl.getAll);
router.post("/", uploaded, validate(createMediaKitSchema), mediaKitCtrl.create);
router.get("/:id", mediaKitCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateMediaKitSchema),
  mediaKitCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("mediaKit").none(),
  mediaKitCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("mediaKit").none(),
  mediaKitCtrl.changeStatus,
);
router.delete("/:id", mediaKitCtrl.destroy);

export { router as MediaKitRoutes };
