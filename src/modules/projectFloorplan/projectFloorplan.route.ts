import { Router } from "express";
import * as projectFloorplanCtrl from "./projectFloorplan.controller.js";
import {
  createprojectFloorplanSchema,
  updateprojectFloorplanSchema,
} from "./projectFloorplan.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("projectFloorplan").any();

router.get("/", projectFloorplanCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createprojectFloorplanSchema),
  projectFloorplanCtrl.create,
);
router.get("/:id", projectFloorplanCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateprojectFloorplanSchema),
  projectFloorplanCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("projectFloorplan").none(),
  projectFloorplanCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("projectFloorplan").none(),
  projectFloorplanCtrl.changeStatus,
);
router.delete("/:id", projectFloorplanCtrl.destroy);

export { router as projectFloorplanRoutes };
