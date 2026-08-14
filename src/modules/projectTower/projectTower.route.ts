import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";
import { createprojectTowerSchema, updateprojectTowerSchema } from "./projectTower.schema.js";
import * as projectTowerController from "./projectTower.controller.js";

const router = Router();
const uploaded = uploadMiddleware("projectTower").fields([
  { name: "image", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "bgImage", maxCount: 1 }
]);

router.get("/", projectTowerController.getAll);
router.post(
  "/",
  uploaded,
  validate(createprojectTowerSchema),
  projectTowerController.create
);
router.get("/:id", projectTowerController.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateprojectTowerSchema),
  projectTowerController.update
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectTower").none(),
  projectTowerController.changeSeq
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectTower").none(),
  projectTowerController.changeStatus
);
router.delete("/:id", projectTowerController.destroy);

export { router as ProjectTowerRoutes };
