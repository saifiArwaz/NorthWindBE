import { Router } from "express";
import * as controller from "./projectMasterPlanCategory.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createProjectMasterPlanCategorySchema,
  updateProjectMasterPlanCategorySchema,
} from "./projectMasterPlanCategory.schema.js";

const router = Router();

router.post(
  "/",
  validate(createProjectMasterPlanCategorySchema),
  controller.create
);

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.patch(
  "/:id",
  validate(updateProjectMasterPlanCategorySchema),
  controller.update
);

router.delete("/:id", controller.destroy);
router.patch("/:id/seq", controller.changeSeq);
router.patch("/:id/status", controller.changeStatus);

export { router as projectMasterPlanCategoryRoutes };
