import { Router } from "express";
import * as mapptingTypologyCtrl from "./mappingTypology.controller.js";
import { createMappingTypologySchema } from "./mappingTypology.schema.js";
import { validate } from "../../middlewares/validate.js";

import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", mapptingTypologyCtrl.getAll);
router.get("/:typologyId/subtypes", mapptingTypologyCtrl.getAllSubTypologies);
router.post(
  "/",
  upload.none(),
  validate(createMappingTypologySchema),
  mapptingTypologyCtrl.create,
);
router.get(
  "/:typologyId/unassigned-subtypes",
  mapptingTypologyCtrl.getUnassignedSubTypes,
);
router.delete(
  "/:typologyId/subtypes/:subTypologyId",
  mapptingTypologyCtrl.removeAssignedSubType,
);

export { router as MappingTypologyRoutes };
