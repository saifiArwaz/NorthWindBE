import { Router } from "express";
import * as typologyCtrl from "./typology.controller.js";
import {
  createTypologySchema,
  updateTypologySchema,
} from "./typology.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

router.get("/", typologyCtrl.getAll);
router.post(
  "/",
  uploadMiddleware("typology").none(),
  validate(createTypologySchema),
  typologyCtrl.create,
);
router.get("/:id", typologyCtrl.getOne);
router.patch(
  "/:id",
  uploadMiddleware("typology").none(),
  validate(updateTypologySchema),
  typologyCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("typology").none(),
  typologyCtrl.changeStatus,
);
router.delete("/:id", typologyCtrl.remove);

export { router as TypologyRoutes };
