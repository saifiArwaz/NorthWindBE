import { Router } from "express";
import * as projectCtrl from "./project.controller.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projects").fields([
  { name: "desktopVideo", maxCount: 1 },
  { name: "mobileVideo", maxCount: 1 },
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "bgImage", maxCount: 1 },
  { name: "featureDesktopImage", maxCount: 1 },
  { name: "featureMobileImage", maxCount: 1 },
  { name: "brochure", maxCount: 1 },
  { name: "elevationImage", maxCount: 1 },
]);

router.get("/filter-list", projectCtrl.getFilterList);
router.get("/", projectCtrl.getAll);
router.get("/:id", projectCtrl.getOne)
router.post("/", uploaded, validate(createProjectSchema), projectCtrl.create);
router.patch(
  "/:id",
  uploaded,
  validate(updateProjectSchema),
  projectCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projects").none(),
  projectCtrl.changeStatus,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projects").none(),
  projectCtrl.changeSeq,
);
router.patch(
  "/:id/isFeature",
  uploadMiddleware("projects").none(),
  projectCtrl.chooseFeatureProject,
);
router.patch(
  "/:id/isHome",
  uploadMiddleware("projects").none(),
  projectCtrl.chooseHomeProject,
);
router.patch(
  "/:id/isPage",
  uploadMiddleware("projects").none(),
  projectCtrl.chooseIsPageProject,
);
router.delete("/:id", projectCtrl.remove);
router.delete("/:id/file", uploaded, projectCtrl.destroySinglefile);

export { router as projectRoutes };
