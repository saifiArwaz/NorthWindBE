import { Router } from "express";
import * as partnersCtrl from "./partners.controller.js";
import {
  createPartnersSchema,
  updatePartnersSchema,
} from "./partners.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("partners").fields([
  { name: "image", maxCount:1 }
]);

router.get("/", partnersCtrl.getAll);
router.post("/", uploaded, validate(createPartnersSchema), partnersCtrl.create);
router.get("/:id", partnersCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updatePartnersSchema),
  partnersCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("partners").none(),
  partnersCtrl.changeStatus,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("partners").none(),
  partnersCtrl.changeSeq,
);
router.delete("/:id", partnersCtrl.destroy);

export { router as PartnersRoutes };
