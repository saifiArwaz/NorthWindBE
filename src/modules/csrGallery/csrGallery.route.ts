import { Router } from "express";
import * as csrGalleryCtrl from "./csrGallery.controller.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";
import { createCsrGallerySchema, updateCsrGallerySchema } from "./csrGallery.schema.js";

const router = Router();

const uploaded = uploadMiddleware("csr").fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

router.get("/", csrGalleryCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createCsrGallerySchema),
  csrGalleryCtrl.create,
);
router.get("/:id", csrGalleryCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateCsrGallerySchema),
  csrGalleryCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("csr").none(),
  csrGalleryCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("csr").none(),
  csrGalleryCtrl.changeStatus,
);
router.delete("/:id", csrGalleryCtrl.remove);
router.delete(
  "/:id/file",
  uploadMiddleware("csr").none(),
  csrGalleryCtrl.destroySinglefile,
);

export { router as CsrGalleryRoutes };
