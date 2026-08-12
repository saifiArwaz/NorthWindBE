import { Router } from "express";
import * as valuesCtrl from "./values.controller.js";
import { createValuesSchema, updateValuesSchema } from "./values.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("values").fields([
  { name: "icon", maxCount: 1 },
]);

router.get("/", valuesCtrl.getAll);
router.post("/", uploaded, validate(createValuesSchema), valuesCtrl.create);
router.get("/:id", valuesCtrl.getOne);
router.patch("/:id", uploaded, validate(updateValuesSchema), valuesCtrl.update);
router.patch(
  "/:id/status",
  uploadMiddleware("values").none(),
  valuesCtrl.changeStatus,
);
router.delete("/:id", valuesCtrl.destroy);

export { router as ValuesRoutes };
