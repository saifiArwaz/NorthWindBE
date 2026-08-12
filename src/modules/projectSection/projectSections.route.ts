import { Router } from "express";
import * as projectSectionCtrl from "./projectSection.controller.js";
import { createProjectSectionsSchema } from "./projectSections.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectSection").any();

router.get("/:projectId/sections", projectSectionCtrl.getAll);

router.get("/", projectSectionCtrl.getProjectSectionList);

router.get("/:projectId/:sectionType", projectSectionCtrl.getOne);
router.post(
  "/",
  uploaded,
  validate(createProjectSectionsSchema),
  projectSectionCtrl.createOrUpdatePageSection,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectSection").none(),
  projectSectionCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectSection").none(),
  projectSectionCtrl.changeStatus,
);
router.delete("/:id", projectSectionCtrl.remove);
router.delete("/:id/file", uploaded, projectSectionCtrl.destroySinglefile);

export { router as projectSectionsRoutes };
