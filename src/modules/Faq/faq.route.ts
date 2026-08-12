import { Router } from "express";
import * as FaqCtrl from "./faq.controller.js";
import { createFaqSchema, updateFaqSchema } from "./faq.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("Faq").any();

router.get("/", FaqCtrl.getAll);
router.post("/", uploaded, validate(createFaqSchema), FaqCtrl.create);
router.get("/:id", FaqCtrl.getOne);
router.patch("/:id", uploaded, validate(updateFaqSchema), FaqCtrl.update);
router.patch("/:id/seq", uploaded, FaqCtrl.changeSeq);
router.patch(
  "/:id/status",
  uploadMiddleware("Faq").none(),
  FaqCtrl.changeStatus,
);
router.delete("/:id", FaqCtrl.destroy);

export { router as FaqRoutes };
