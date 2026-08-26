import { Router } from "express";
import * as projectFaqCtrl from "./projectFaq.controller.js";
import {
  createProjectFaqSchema,
  updateProjectFaqSchema,
} from "./projectFaq.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectFaq").any();

router.get("/", projectFaqCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createProjectFaqSchema),
  projectFaqCtrl.create,
);
router.get("/:id", projectFaqCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateProjectFaqSchema),
  projectFaqCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectFaq").none(),
  projectFaqCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectFaq").none(),
  projectFaqCtrl.changeStatus,
);
router.delete("/:id", projectFaqCtrl.destroy);

export { router as projectFaqRoutes };
