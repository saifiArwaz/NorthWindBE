import { Router } from "express";
import * as localityCtrl from "./locality.controller.js";
import {
  createLocalitySchema,
  updateLocalitySchema,
} from "./locality.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const upload = uploadMiddleware("locality").none();

router.get("/", localityCtrl.getList);
router.post(
  "/",
  upload,
  validate(createLocalitySchema),
  localityCtrl.createLocality,
);
router.get("/:id", localityCtrl.getLocalityById);
router.patch(
  "/:id",
  upload,
  validate(updateLocalitySchema),
  localityCtrl.updateLocalityById,
);
router.patch(
  "/:id/status",
  uploadMiddleware("locality").none(),
  localityCtrl.changeStatus,
);
router.delete("/:id", localityCtrl.deleteById);

export { router as LocalityRoutes };
