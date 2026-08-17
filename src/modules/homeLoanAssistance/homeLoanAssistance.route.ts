import { Router } from "express";
import * as homeLoanAssistanceCtrl from "./homeLoanAssistance.controller.js";
import {
  createHomeLoanAssistanceSchema,
  updateHomeLoanAssistanceSchema,
} from "./homeLoanAssistance.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("homeLoanAssistance").any();

router.get("/", homeLoanAssistanceCtrl.getAll);
router.post("/", uploaded, validate(createHomeLoanAssistanceSchema), homeLoanAssistanceCtrl.create);
router.get("/:id", homeLoanAssistanceCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateHomeLoanAssistanceSchema),
  homeLoanAssistanceCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("homeLoanAssistance").none(),
  homeLoanAssistanceCtrl.changeStatus,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("homeLoanAssistance").none(),
  homeLoanAssistanceCtrl.changeSeq,
);
router.delete("/:id", homeLoanAssistanceCtrl.remove);

export { router as HomeLoanAssistanceRoutes };
