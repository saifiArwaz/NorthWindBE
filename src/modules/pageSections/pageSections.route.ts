import { Router } from "express";
import * as pageSectionCtrl from "./pageSections.controller.js";
import {
  createPageSectionSchema,
  updatePageSectionSchema,
} from "./pageSections.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("pageSections").any();

router.get("/", pageSectionCtrl.getPageSectionListByPageSlug);
router.post(
  "/",
  uploaded,
  validate(createPageSectionSchema),
  pageSectionCtrl.create,
);
router.get("/:id", pageSectionCtrl.getPageById);
router.patch(
  "/:id",
  uploaded,
  validate(updatePageSectionSchema),
  pageSectionCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("pageSections").none(),
  pageSectionCtrl.changeStatus,
);
router.patch("/:id/seq", uploadMiddleware.none(), pageSectionCtrl.changeSeq);

router.delete("/:id", pageSectionCtrl.deleteById);
router.delete("/:id/file", uploaded, pageSectionCtrl.destroySinglefile);

export { router as pageSectionsRoutes };
