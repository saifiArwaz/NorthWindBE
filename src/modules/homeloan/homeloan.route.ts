import { Router } from "express";
import * as partnersCtrl from "./homeloan.controller.js";
import {
  createHomeLoanSchema,
  updateHomeLoanSchema,
} from "./homeloan.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("homeloan").any();

router.get("/", partnersCtrl.getAll);
router.post("/", uploaded, validate(createHomeLoanSchema), partnersCtrl.create);
router.get("/:id", partnersCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateHomeLoanSchema),
  partnersCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("homeloan").none(),
  partnersCtrl.changeStatus,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("homeloan").none(),
  partnersCtrl.changeSeq,
);
router.delete("/:id", partnersCtrl.destroy);

export { router as HomeLoanRoutes };
