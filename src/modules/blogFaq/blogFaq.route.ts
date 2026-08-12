import { Router } from "express";
import * as blogFaqCtrl from "./blogFaq.controller.js";
import {
  createBlogFaqSchema,
  updateBlogFaqSchema,
} from "./blogFaq.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("blogFaq").any();

router.get("/", blogFaqCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createBlogFaqSchema),
  blogFaqCtrl.create,
);
router.get("/:id", blogFaqCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateBlogFaqSchema),
  blogFaqCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("blogFaq").none(),
  blogFaqCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("blogFaq").none(),
  blogFaqCtrl.changeStatus,
);
router.delete("/:id", blogFaqCtrl.destroy);

export { router as blogFaqRoutes };
