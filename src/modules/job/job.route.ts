import { Router } from "express";
import * as jobCtrl from "./job.controller.js";
import { createJobSchema, updateJobSchema } from "./job.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

router.get("/", jobCtrl.getAll);
router.post(
  "/",
  uploadMiddleware("job").none(),
  validate(createJobSchema),
  jobCtrl.create,
);
router.get("/:id", jobCtrl.getOne);
router.patch(
  "/:id",
  uploadMiddleware("job").none(),
  validate(updateJobSchema),
  jobCtrl.update,
);
router.patch("/:id/seq", uploadMiddleware("job").none(), jobCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadMiddleware("job").none(),
  jobCtrl.changeStatus,
);
router.delete("/:id", jobCtrl.remove);

export { router as JobRoutes };
