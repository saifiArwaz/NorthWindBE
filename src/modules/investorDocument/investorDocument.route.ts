import { Router } from "express";
import * as investorDocumentsCtrl from "./investorDocument.controller.js";
import {
  createinvestorDocumentschema,
  updateinvestorDocumentschema,
} from "./investorDocument.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("investorDocument").fields([
  { name: "logo", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.get("/:tabId/list", investorDocumentsCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createinvestorDocumentschema),
  investorDocumentsCtrl.create,
);
router.get("/:id", investorDocumentsCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateinvestorDocumentschema),
  investorDocumentsCtrl.update,
);
router.patch("/:id/seq", uploaded, investorDocumentsCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadMiddleware("investorDocument").none(),
  investorDocumentsCtrl.changeStatus,
);
router.delete("/:id", investorDocumentsCtrl.remove);

export { router as investorDocumentsRoutes };
