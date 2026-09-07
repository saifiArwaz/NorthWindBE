import { Router } from "express";
import * as investorAppreciationCtrl from "./investorAppreciation.controller.js";
import {
  createInvestorAppreciationSchema,
  updateInvestorAppreciationSchema,
} from "./investorAppreciation.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const noUpload = uploadMiddleware("investorAppreciation").none();

router.get("/", investorAppreciationCtrl.getAll);
router.post(
  "/",
  noUpload,
  validate(createInvestorAppreciationSchema),
  investorAppreciationCtrl.create,
);
router.get("/:id", investorAppreciationCtrl.getOne);
router.patch(
  "/:id",
  noUpload,
  validate(updateInvestorAppreciationSchema),
  investorAppreciationCtrl.update,
);
router.patch(
  "/:id/seq",
  noUpload,
  investorAppreciationCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  noUpload,
  investorAppreciationCtrl.changeStatus,
);
router.delete("/:id", investorAppreciationCtrl.remove);

export { router as InvestorAppreciationRoutes };
