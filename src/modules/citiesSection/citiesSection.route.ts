import { Router } from "express";
import * as citySectionCtrl from "./citiesSection.controller.js";
import { createCitiesSectionSchema } from "./citiesSection.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("citiesSection").any();

router.get("/", citySectionCtrl.getCitiesSectionList);

router.get("/:cityId/sections", citySectionCtrl.getAll);
router.get("/:cityId/:sectionType", citySectionCtrl.getOne);
router.post(
  "/",
  uploaded,
  validate(createCitiesSectionSchema),
  citySectionCtrl.createOrUpdateCitiesSection,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("citiesSection").none(),
  citySectionCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("citiesSection").none(),
  citySectionCtrl.changeStatus,
);
router.delete("/:id", citySectionCtrl.remove);
router.delete("/:id/file", uploaded, citySectionCtrl.destroySinglefile);

export { router as citySectionRoutes };
