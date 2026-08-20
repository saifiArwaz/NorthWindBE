import { Router } from "express";
import * as contentByTypeCtrl from "./contentByType.controller.js";
import {
  createContentByTypeSchema,
  updateContentByTypeSchema,
} from "./contentByType.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("contentByType").any();

router.get("/", contentByTypeCtrl.getContentByTypeList);
router.post(
  "/",
  uploaded,
  validate(createContentByTypeSchema),
  contentByTypeCtrl.create,
);
router.get("/:id", contentByTypeCtrl.getById);
router.patch(
  "/:id",
  uploaded,
  validate(updateContentByTypeSchema),
  contentByTypeCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("contentByType").none(),
  contentByTypeCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("contentByType").none(),
  contentByTypeCtrl.changeStatus,
);
router.delete("/:id", contentByTypeCtrl.deleteById);
router.delete("/:id/file", uploaded, contentByTypeCtrl.destroySinglefile);

export { router as ContentByTypeRoutes };
