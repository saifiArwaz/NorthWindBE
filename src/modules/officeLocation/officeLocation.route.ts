import { Router } from "express";
import * as officeLocationCtrl from "./officeLocation.controller.js";
import {
  createOfficesLocationSchema,
  updateOfficesLocationSchema,
} from "./officeLocation.schema.js";
import { validate } from "../../middlewares/validate.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", officeLocationCtrl.getAll);
router.post(
  "/",
  upload.none(),
  validate(createOfficesLocationSchema),
  officeLocationCtrl.create,
);
router.get("/:id", officeLocationCtrl.getOne);
router.patch(
  "/:id",
  upload.none(),
  validate(updateOfficesLocationSchema),
  officeLocationCtrl.update,
);
router.patch("/:id/status", upload.none(), officeLocationCtrl.changeStatus);
router.delete("/:id", officeLocationCtrl.remove);

export { router as OfficeLocationRoutes };
