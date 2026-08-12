import { Router } from "express";
import * as whyIndiaCtrl from "./whyIndia.controller.js";
import {
  createWhyIndiaSchema,
  updateWhyIndiaSchema,
} from "./whyIndia.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("whyIndia").fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
]);

router.get("/", whyIndiaCtrl.getAll);
router.post("/", uploaded, validate(createWhyIndiaSchema), whyIndiaCtrl.create);
router.get("/:id", whyIndiaCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateWhyIndiaSchema),
  whyIndiaCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("whyIndia").none(),
  whyIndiaCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("whyIndia").none(),
  whyIndiaCtrl.changeStatus,
);
router.delete("/:id", whyIndiaCtrl.remove);

export { router as WhyIndiaRoutes };
