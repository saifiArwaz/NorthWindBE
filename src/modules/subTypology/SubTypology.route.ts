import { Router } from "express";
import * as subTypologyCtrl from "./SubTypology.controller.js";
import {
  createSubTypologySchema,
  updateSubTypologySchema,
} from "./SubTypology.schema.js";
import { validate } from "../../middlewares/validate.js";

import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", subTypologyCtrl.getAll);
router.post(
  "/",
  upload.none(),
  validate(createSubTypologySchema),
  subTypologyCtrl.create,
);
router.get("/:id", subTypologyCtrl.getOne);
router.patch(
  "/:id",
  upload.none(),
  validate(updateSubTypologySchema),
  subTypologyCtrl.update,
);
router.patch("/:id/status", upload.none(), subTypologyCtrl.changeStatus);
router.delete("/:id", subTypologyCtrl.remove);

export { router as SubTypologyRoutes };
