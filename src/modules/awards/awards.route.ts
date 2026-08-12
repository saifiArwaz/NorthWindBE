import { Router } from "express";
import * as awardsCtrl from "./awards.controller.js";
import { createAwardsSchema, updateAwardsSchema } from "./awards.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("awards").any();

router.get("/", awardsCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createAwardsSchema),
  awardsCtrl.create,
);
router.get("/:id", awardsCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateAwardsSchema),
  awardsCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("awards").none(),
  awardsCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("awards").none(),
  awardsCtrl.changeStatus,
);
router.delete("/:id", awardsCtrl.remove);

export { router as AwardsRoutes };

