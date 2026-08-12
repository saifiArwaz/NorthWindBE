import { Router } from "express";
import * as csrContentGalleries from "./csrContentGalleries.controller.js";
import {
  createCsrContentGalleriesSchema,
  updateCsrContentGalleriesSchema,
} from "./csrContentGalleries.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("csrContentGalleries").any();

router.get("/", csrContentGalleries.getAll);
router.post(
  "/",
  uploaded,
  validate(createCsrContentGalleriesSchema),
  csrContentGalleries.create,
);
router.get("/:id", csrContentGalleries.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateCsrContentGalleriesSchema),
  csrContentGalleries.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("csrContentGalleries").none(),
  csrContentGalleries.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("csrContentGalleries").none(),
  csrContentGalleries.changeStatus,
);
router.delete("/:id", csrContentGalleries.deleteById);

export { router as CsrContentGalleriesRoutes };
