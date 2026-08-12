import { Router } from "express";
import * as projectMediaCtrl from "./projectMedia.controller.js";
import {
  createprojectMediaSchema,
  updateprojectMediaSchema,
} from "./projectMedia.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectMedia").any();

router.get("/", projectMediaCtrl.getAll);
router.get("/:mediaType/list", projectMediaCtrl.getByMediaType);
router.post(
  "/",
  uploaded,
  validate(createprojectMediaSchema),
  projectMediaCtrl.create,
);
router.get("/:id", projectMediaCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateprojectMediaSchema),
  projectMediaCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectMedia").none(),
  projectMediaCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectMedia").none(),
  projectMediaCtrl.changeStatus,
);
router.delete("/:id", projectMediaCtrl.destroy);

export { router as ProjectMediaRoutes };
