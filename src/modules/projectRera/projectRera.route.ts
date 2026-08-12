import { Router } from "express";
import * as projectReraCtrl from "./projectRera.controller.js";
import {
  createprojectReraSchema,
  updateprojectReraSchema,
} from "./projectRera.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("projectRera").fields([
  { name: "qrCode", maxCount: 1 },
]);

router.get("/", projectReraCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createprojectReraSchema),
  projectReraCtrl.create,
);
router.get("/:id", projectReraCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateprojectReraSchema),
  projectReraCtrl.update,
);
router.patch("/:id/seq", uploaded, projectReraCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadMiddleware("projectRera").none(),
  projectReraCtrl.changeStatus,
);
router.delete("/:id", projectReraCtrl.destroy);

export { router as projectReraRoutes };
