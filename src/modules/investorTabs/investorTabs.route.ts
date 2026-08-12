import { Router } from "express";
import * as investorTabsCtrl from "./investorTabs.controller.js";
import {
  createinvestorTabSchema,
  updateinvestorTabSchema,
} from "./investorTabs.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("investorTabs").fields([
  { name: "logo", maxCount: 1 },
]);

router.get("/", investorTabsCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createinvestorTabSchema),
  investorTabsCtrl.create,
);
router.get("/:id", investorTabsCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateinvestorTabSchema),
  investorTabsCtrl.update,
);
router.patch("/:id/seq", uploaded, investorTabsCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadMiddleware("investorTabs").none(),
  investorTabsCtrl.changeStatus,
);
router.delete("/:id", investorTabsCtrl.remove);

export { router as investorTabsRoutes };
