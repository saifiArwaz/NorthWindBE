import { Router } from "express";
import * as projectStatusCtrl from "./projectStatus.controller.js";
import {
  createProjectStatusSchema,
  updateProjectStatusSchema,
} from "./projectStatus.schema.js";
import { validate } from "../../middlewares/validate.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", projectStatusCtrl.getAll);
router.post(
  "/",
  upload.none(),
  validate(createProjectStatusSchema),
  projectStatusCtrl.create,
);
router.get("/:id", projectStatusCtrl.getOne);
router.patch(
  "/:id",
  upload.none(),
  validate(updateProjectStatusSchema),
  projectStatusCtrl.update,
);
router.patch("/:id/seq", upload.none(), projectStatusCtrl.changeSeq);
router.patch("/:id/status", upload.none(), projectStatusCtrl.changeStatus);
router.delete("/:id", projectStatusCtrl.remove);

export { router as ProjectStatusRoutes };
