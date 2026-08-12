import { Router } from "express";
import * as projectLocationAdvCtrl from "./projectLocationAdvantage.controller.js";
import {
  createprojectLocationAdvSchema,
  updateprojectLocationAdvSchema,
} from "./projectLocationAdvantage.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploadNone = uploadMiddleware("projectLocationAdvantage").none();

router.get("/", projectLocationAdvCtrl.getAll);
router.post(
  "/",
  uploadNone,
  validate(createprojectLocationAdvSchema),
  projectLocationAdvCtrl.create,
);
router.get("/:id", projectLocationAdvCtrl.getOne);
router.patch(
  "/:id",
  uploadNone,
  validate(updateprojectLocationAdvSchema),
  projectLocationAdvCtrl.update,
);
router.patch("/:id/seq", uploadNone, projectLocationAdvCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadNone,
  projectLocationAdvCtrl.changeStatus,
);
router.delete("/:id", projectLocationAdvCtrl.destroy);

export { router as projectLocationAdvRoutes };
