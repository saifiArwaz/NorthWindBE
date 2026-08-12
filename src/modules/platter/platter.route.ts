import { Router } from "express";
import * as platterCtrl from "./platter.controller.js";
import { createPlatterSchema, updatePlatterSchema } from "./platter.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("platter").fields([
  { name: "desktop_image", maxCount: 1 },
  { name: "mobile_image", maxCount: 1 },
  { name: "home_image", maxCount: 1 },
]);

router.get("/", platterCtrl.getAll);
router.post("/", uploaded, validate(createPlatterSchema), platterCtrl.create);
router.get("/:id", platterCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updatePlatterSchema),
  platterCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("platter").none(),
  platterCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("platter").none(),
  platterCtrl.changeStatus,
);
router.delete("/:id", platterCtrl.destroy);

export { router as PlatterRoutes };
