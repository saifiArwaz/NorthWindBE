import { Router } from "express";
import * as projectContentDetailsController from "./projectContentDetails.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createProjectContentDetailsSchema,
  updateProjectContentDetailsSchema,
} from "./projectContentDetails.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectContentDetails").any();


router.get("/", projectContentDetailsController.getAll);

router.post(
  "/",
  uploaded,
  validate(createProjectContentDetailsSchema),
  projectContentDetailsController.create,
);
router.get("/:id", projectContentDetailsController.getOne);


router.patch(
  "/:id",
  uploaded,
  validate(updateProjectContentDetailsSchema),
  projectContentDetailsController.update,
);

router.patch(
  "/:id/seq",
  uploadMiddleware("projectContentDetails").none(),
  projectContentDetailsController.changeSeq,
);

router.patch(
  "/:id/status",
  uploadMiddleware("projectContentDetails").none(),
  projectContentDetailsController.changeStatus,
);

router.delete("/:id", projectContentDetailsController.destroy);

export default router;
