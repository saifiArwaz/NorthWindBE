import { Router } from "express";
import * as csrCategoryCtrl from "./csrCategory.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createCsrCategorySchema,
  updateCsrCategorySchema,
} from "./csrCategory.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const upload = uploadMiddleware("csr-category");

router.get("/", csrCategoryCtrl.getAll);
router.post(
  "/",
  upload.none(),
  validate(createCsrCategorySchema),
  csrCategoryCtrl.create,
);
router.get("/:id", csrCategoryCtrl.getOne);
router.patch(
  "/:id",
  upload.none(),
  validate(updateCsrCategorySchema),
  csrCategoryCtrl.update,
);
router.patch("/:id/seq", upload.none(), csrCategoryCtrl.changeSeq);
router.patch("/:id/status", upload.none(), csrCategoryCtrl.changeStatus);
router.delete("/:id", csrCategoryCtrl.remove);

export { router as CsrCategoryRoutes };
